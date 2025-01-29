import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

const userSocketMap = {};
const driverSocketMap = {};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    if(socket.handshake.query.role === "deliveryMan"){
        const userId = socket.handshake.query.userId;
        if (userId) driverSocketMap[userId] = socket.id;
    }else{
        const userId = socket.handshake.query.userId;
        if (userId) userSocketMap[userId] = socket.id;
    }

    console.log(userSocketMap)

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlinUsers', Object.keys(userSocketMap))
    });
    
});

export { io, app, server };