import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { verifyToken } from '../lib/utils.js';


export const protectRoute = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        console.log('token', token)
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized user Access. No token provided."
            })
        }

        const decoded = verifyToken(token);
        console.log(decoded)
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized user Access. No token provided."
            })
        }

        const user = await User.findById(decoded.userId).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("Error in protededRoute middleware", error.message);
        res.status(500).json({
            Message: "Internal server error"
        })
    }
}