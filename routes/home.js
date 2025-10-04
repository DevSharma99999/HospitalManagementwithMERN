import express from 'express'
import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const homeWay=express.Router();
homeWay.get("/",(req ,res ,next)=>{
   res.sendFile(path.join(__dirname,'../','utils','home.html'));
});

export default homeWay;