import jwt from "jsonwebtoken";

export const generateToken = (userId, res, role) => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true, 
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
};

export const verifyToken = (token) =>{
    return jwt.verify(token, process.env.JWT_SECRET);
}