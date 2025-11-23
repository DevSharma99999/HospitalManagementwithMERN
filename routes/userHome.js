import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { verifyJWT } from "../middleware/jwtAuthentication.js";
import { patientProfileAuth } from "../middleware/patientProfileAuth.js";
import { patient_profile_controller } from '../controller/patientProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PatientHomeWay = express.Router();
PatientHomeWay.get("/user/home", (req, res, next) => {
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'usershowcase.html'));
})
PatientHomeWay.get("/patient/profile",(req,res,next)=>{
    res.sendFile(path.join(__dirname,"..","public","html","patient_profile.html"));
})
PatientHomeWay.get("/patient/profile/data",verifyJWT,patientProfileAuth,patient_profile_controller);