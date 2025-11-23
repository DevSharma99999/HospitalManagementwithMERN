import express from 'express';
import path from 'path';
import {aiusercontroller}  from '../controller/home_controller.js';
import { resultscontroller } from '../controller/home_controller.js';
import { chatcontroller } from '../controller/home_controller.js';
export const airoutes=express.Router();
airoutes.get("/ai",aiusercontroller);
airoutes.post("/results",resultscontroller);
airoutes.post("/chat",chatcontroller);