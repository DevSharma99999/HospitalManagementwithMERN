import express from 'express'
import { loginAuth } from '../controller/userLogin.js';
import { restrictTODoctor } from '../middleware/jwtAuthentication.js';

export const loginsuccessful = express.Router();

loginsuccessful.post("/login", loginAuth, (req, res) => {
    res.send("welcome user");
});
