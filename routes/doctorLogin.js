import express from 'express'
import path from 'path'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { doctorLoginAuth } from '../controller/doctorLogin.js';
import { restrictTODoctor } from '../middleware/jwtAuthentication.js';
import { doctorverifyJWT } from '../middleware/doctorverifyjwt.js';
export const doctorloginsuccessful = express.Router();

doctorloginsuccessful.post("/doctor-login",doctorLoginAuth ,doctorverifyJWT, restrictTODoctor);

doctorloginsuccessful.get("/doctor-reset-password",(req,res,next)=>{
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname,'..','public','html','doctor-reset-password.html'));
}
)
doctorloginsuccessful.get("/doctor-forgot-password",(req,res,next)=>{
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname,'..','public','html','doctor-forgot-password.html'));
}
)