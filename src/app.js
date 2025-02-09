import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './lib/connectDatabase.js';
import { initializeSocket } from './lib/socket.js';

import authRoutes from './routes/auth.route.js';
import orderRoutes from './routes/order.routes.js';

import errorHandler from './middleware/errorHandler.middleware.js';

const app = express();
export const server = http.createServer(app);
initializeSocket(server);


app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 seconds
    max: 10, // Limit each IP to 5 requests per window
    message: "Too many requests, please try again later.",
}));


app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
        console.log(`Server Running On Port: ${PORT}`);
        connectDatabase();
    });
}