import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const patientFormfile = express.Router();
patientFormfile.get("/patient", (req, res, next) => {
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname, '..', 'public','html', 'patientform.html'));
}
)