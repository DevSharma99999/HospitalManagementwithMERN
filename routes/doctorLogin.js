import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { doctorLoginAuth } from '../controller/doctorLogin.js';
import { forgotPassword } from '../controller/doctorForgotPasswordController.js';
import { resetPassword } from '../controller/resetPasswordController.js';

export const doctorloginsuccessful = express.Router();

// 🔧 removed dead doctorverifyJWT/restrictTODoctor chain — doctorLoginAuth
// already terminates the request itself and never calls next()
doctorloginsuccessful.post("/doctor-login", doctorLoginAuth);

// 🆕 API routes — these were missing entirely
doctorloginsuccessful.post("/api/doctor-forgot-password", forgotPassword);
doctorloginsuccessful.post("/api/doctor-reset-password", resetPassword);

// Page-serving routes
doctorloginsuccessful.get("/doctor-forgot-password", (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'doctor-forgot-password.html'));
});

// 🔧 token now comes from the URL path, matching the emailed reset link format
doctorloginsuccessful.get("/doctor-reset-password/:token", (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'doctor-reset-password.html'));
});