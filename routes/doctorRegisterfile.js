import express from 'express';
import path from 'path'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const doctorRegisterfile= express.Router();
doctorRegisterfile.get("/doctor-register-form",(req,res,next)=>{
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname,'..','utils','doctorform.html'));
}
)