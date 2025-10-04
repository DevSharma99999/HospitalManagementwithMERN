import express from 'express'
import { doctorLoginAuth } from '../controller/doctorLogin.js';
import { restrictTODoctor } from '../middleware/jwtAuthentication.js';

export const doctorloginsuccessful = express.Router();

doctorloginsuccessful.post("/doctor-login",doctorLoginAuth , restrictTODoctor);