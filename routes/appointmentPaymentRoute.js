import express from "express";
import { initiateBooking } from "../controller/initiateBooking.js";
import { verifyPayment } from "../controller/verifyPayment.js";
import { patientProfileAuth } from "../middleware/patientProfileAuth.js";
import { verifyJWT } from "../middleware/jwtAuthentication.js";
// 🔑 use the exact same auth middleware import you already use in bookingWay.js
// (the one that sets req.patient_id) — copy that import line here.

const router = express.Router();

router.post("/api/appointments/initiate",verifyJWT, patientProfileAuth, initiateBooking);
router.post("/api/appointments/verify-payment", verifyJWT, patientProfileAuth, verifyPayment);

export const appointmentPaymentWay = router;