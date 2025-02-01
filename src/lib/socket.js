import { Server } from "socket.io";
import http from "http";
import express from "express";
import { verifyToken } from "./utils.js";
import { handleSocketEvents } from "./events.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

const customersSocketMap = {};
const driverSocketMap = {};

export function getDriverSocketId(userId) {
    return driverSocketMap[userId]
}

export function getCustomerSocketId(userId) {
    return customersSocketMap[userId]
}

export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173"],
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.query?.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = verifyToken(token);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {

        console.log("A user connected", socket.id);

        const userId = socket.handshake.query.userId;

        if (socket.user.role === "deliveryMan") {
            if (userId) driverSocketMap[userId] = socket.id;
            socket.join("drivers");
        } else {
            if (userId) customersSocketMap[userId] = socket.id;
            socket.join("customers");
        }

        handleSocketEvents(io, socket);
    });

    return io;
}