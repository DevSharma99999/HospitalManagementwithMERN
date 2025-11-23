import express from "express";
import { patientRegister } from "../middleware/patientregisterform.js";
import { patientProfileAuth } from "../middleware/patientProfileAuth.js";
import { checkPatientProfile, ensureAuthenticated } from "../middleware/isUserlogin.js";
import { verifyJWT } from "../middleware/jwtAuthentication.js";

export const patientregisterWay = express.Router();

patientregisterWay.post("/patient/register-done", patientRegister)