// File: controller/patientLoginAuth.js

import { patient } from '../mongoose modules/patientModule.js';
import jwt from 'jsonwebtoken';

export const patientLoginAuth = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    try {
        // 🔑 select("+password") needed since schema now has select:false on password
        const existingPatient = await patient.findOne({ email }).select("+password");

        if (!existingPatient) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email."
            });
        }

        const isPasswordValid = await existingPatient.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        const payload = {
            _id: existingPatient._id,
            email: existingPatient.email,
            user_type: existingPatient.user_type
        };

        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            sameSite: 'Lax',
            path: '/',
            maxAge: 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${existingPatient.firstName}!`,
            redirectUrl: "/patient/activity"
        });
    } catch (error) {
        console.error("Patient Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication."
        });
    }
};