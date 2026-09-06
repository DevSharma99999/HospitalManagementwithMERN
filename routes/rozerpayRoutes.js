import express from "express";
import { initiateBooking } from "../controller/initiateBooking.js";
import { verifyPayment } from "../controller/verifyPayment.js";
import { razorpayWebhook } from "../controller/razorpayWebHook.js";
import { patientProfileAuth } from "../middleware/patientProfileAuth.js";
import { verifyJWT } from "../middleware/jwtAuthentication.js";
// ...your existing auth middleware import

const router = express.Router();

router.post("/api/appointments/initiate", verifyJWT, patientProfileAuth, initiateBooking);
router.post("/api/appointments/verify-payment", verifyJWT, patientProfileAuth, verifyPayment);

// 🔑 IMPORTANT: webhook route needs the RAW body, not JSON-parsed.
// Register this BEFORE your global express.json() middleware, or scope
// express.raw() specifically to this path:
router.post("/api/webhooks/razorpay", express.raw({ type: "application/json" }), razorpayWebhook);

export default router;
