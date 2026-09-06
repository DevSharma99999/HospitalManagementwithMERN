import express from "express";
import { patientLoginAuth } from "../middleware/patientLogin.js";
import { requestPasswordReset, resetPassword } from "../controller/forgotPasswordController.js";

const router = express.Router();

router.post("/api/patient/login", patientLoginAuth); // 🔧 adjust path to match your existing route if different
router.post("/api/patient/forgot-password", requestPasswordReset);
router.post("/api/patient/reset-password", resetPassword);

export const patientAuthWay = router;