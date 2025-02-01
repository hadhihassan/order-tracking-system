import { bcryptPassword, compareHashedPassword, generateBcryptSalt } from "../lib/bcrypt.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
    const { fullName, email, password, role } = req.body;
    try {
        if (!fullName || !email ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await generateBcryptSalt()
        const hashedPassword = await bcryptPassword(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role
        });

        if (newUser) {
            generateToken(newUser._id, res, role);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials"
            })
        }

        const isPasswordCorrect = await compareHashedPassword(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid Credentials"
            })
        }

        generateToken(user._id, res, user.role);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            role: user.role
        })
    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({
            message: "Logged our successfully"
        })
    } catch (error) {
        console.log("Error in Loggedoout controller", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}