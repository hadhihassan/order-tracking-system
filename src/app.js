import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDatabase } from '../src/lib/connectDatabase.js'
import { app, server } from '../src/lib/socket.js'
import errorHandler from '../src/middleware/errorHandler.middleware.js'
dotenv.config();


app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server Running On Port: \t${PORT}`);
    connectDatabase();
});
