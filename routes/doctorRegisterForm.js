import express from "express";
import { doctorDetails } from "../controller/doctorRegisterController.js";
import { forgotPassword } from "../controller/forgetPasswordController.js";
import { resetPassword } from "../controller/resetPasswordController.js";

export const doctorform = express.Router();

    doctorform.post("/doctor-register-form",doctorDetails);

    
    doctorform.post("/api/doctor-forgot-password",forgotPassword);
    doctorform.post("/api/doctor-reset-password",resetPassword);