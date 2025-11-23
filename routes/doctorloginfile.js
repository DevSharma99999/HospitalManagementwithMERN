import express from 'express';
import path from 'path'; 
import { fileURLToPath } from 'url';
import { doctorverifyJWT } from '../middleware/doctorverifyjwt.js';
import { getDoctorProfile } from '../controller/doctorProfileController.js';
import { updateDoctorProfile } from '../controller/updateDoctorProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const doctorloginfile= express.Router();
doctorloginfile.get("/doctor-login",(req,res,next)=>{
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname,'..','public','html','doctorlogin.html'));
}
)
doctorloginfile.get("/doctor/profile", doctorverifyJWT,(req, res) => {
    // Note: Adjust the path if necessary
    res.sendFile(path.join(__dirname,  '..', 'public', 'html', 'doctor-profile-view.html'));
});
doctorloginfile.get("/api/doctor/profile-data", doctorverifyJWT, getDoctorProfile);
// Route 2: Serve the HTML view (This is the frontend URL the doctor clicks)

doctorloginfile.put("/api/doctor/profile-data", doctorverifyJWT, updateDoctorProfile);
