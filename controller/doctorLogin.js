import jwt from "jsonwebtoken";
import { doctor } from "../mongoose modules/doctormodule.js";

export const doctorLoginAuth = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        const foundDoctor = await doctor.findOne({ email: email.trim().toLowerCase() }).select("+password");

        if (!foundDoctor) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const isPasswordValid = await foundDoctor.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const payload = {
            _id: foundDoctor._id,
            user_type: foundDoctor.user_type
        };

        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.clearCookie('accessToken');
        res.clearCookie('doctorAccessToken');
        res.cookie('doctorAccessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: `Welcome back, Dr. ${foundDoctor.lastName}!`,
            redirectUrl: "/doctor"
        });

    } catch (error) {
        console.error("Doctor Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error during login." });
    }
};