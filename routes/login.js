import express from 'express';
import { Router } from "express";
import path from 'path'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const login= express.Router();
login.get("/login",(req,res,next)=>{
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname,'..','utils','login.html'));
}
)
