import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { deleteAppointment } from '../controller/deleteAppointment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const patientLoginFileWay = express.Router();
patientLoginFileWay.get("/patient-login", (req, res, next) => {
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'patientLogin.html'));
})

patientLoginFileWay.get("/patient/delete-appointment/:appointmentId", deleteAppointment);