import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const wrongWay=express.Router();
wrongWay.use((req,res,next)=>{
    res.status(404);
    res.sendFile(path.join(__dirname,'../','utils','404.html'));
})

export default wrongWay;