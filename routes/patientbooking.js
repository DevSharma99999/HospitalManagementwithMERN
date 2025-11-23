import express from 'express';
// Assuming checkAvailability is in the middleware folder alongside other auth checks
import { checkAvailability } from '../controller/checkAvailability.js'; 
import { verifyJWT } from '../middleware/jwtAuthentication.js';
import { patientProfileAuth } from '../middleware/patientProfileAuth.js';

export const bookingWay = express.Router();

// Middleware chain to ensure: 
// 1. User is authenticated (verifyJWT)
// 2. User has a complete patient profile (patientProfileAuth)
const patientAuthChain = [verifyJWT, patientProfileAuth];

/**
 * POST /api/appointments/book
 * Handles the final booking request from the patient.
 * The booking process relies heavily on the checkAvailability middleware 
 * (which handles validation, conflict checks, and the final save).
 */
bookingWay.post('/api/appointments/book', ...patientAuthChain, checkAvailability);
