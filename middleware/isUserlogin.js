// Middleware to ensure user is authenticated
// (You should already have something like this)
import { patient } from '../mongoose modules/patientModule.js';
export const ensureAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User must be logged in." });
  }
  next();
};

// Middleware to check patient profile existence
export const checkPatientProfile = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const existing = await patient.findOne({ user_id: userId });
    if (existing) {
      // Profile exists, attach it and continue
      req.patient = existing;
      return res.status(409).json({
        success: false,
        message: "Patient profile found. Please login.",
        // allowRegistration: true
      });
      
    } else {
      return next();
    }
  } catch (err) {
    console.error("Error checking patient profile:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
