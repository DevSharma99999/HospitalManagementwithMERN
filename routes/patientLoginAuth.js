import express from 'express'
import { verifyJWT } from '../middleware/jwtAuthentication.js';
import { patientLoginAuth } from '../middleware/patientLogin.js'
import { patient_profile_controller } from '../controller/patientProfile.js';
import { updatePatientProfile } from '../controller/patientProfileController.js';
export const patientLoginWay = express.Router();
patientLoginWay.post("/patient-home",patientLoginAuth);

// In patientLoginWay router
patientLoginWay.get("/api/patient/profile-data", verifyJWT, patient_profile_controller);
patientLoginWay.put("/api/patient/profile-data",verifyJWT,updatePatientProfile);