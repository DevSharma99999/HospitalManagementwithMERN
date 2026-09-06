import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Adjust these paths to match wherever you actually saved the HTML files
// (mirroring your existing pattern, e.g. views/ or public/pages/)
router.get("/patient/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/patientLogin.html"));
});

router.get("/patient/forgot-password", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/login.html"));
});

router.get("/patient/reset-password/:token", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/resetPatientPassword.html"));
});

export const patientAuthPagesWay = router;