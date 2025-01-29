import mongoose from "mongoose";

export  const connectDatabase = () => {
    mongoose
        .connect(process.env.MONGO_URL)
        .then(() => {
            console.info("Database Status: \tConnected");
        })
        .catch((err) => console.error(err));
};