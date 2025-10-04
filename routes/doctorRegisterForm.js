import express from "express";
import { doctorDetails } from "../controller/doctorRegisterController.js";

export const doctorform = express.Router();

    doctorform.post("/doctor-register-form",doctorDetails);

