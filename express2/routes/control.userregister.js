import express from "express";
const adminWay = express.Router();
import { user } from "../mongoose modules/userdatamodule.js";
import mongoose from "mongoose";

adminWay.post("/SignUp-succesful", async (req, res, next) => {
    const userName = (req.body.userName);
    const password = (req.body.password);
    const email = (req.body.email);
    if (!userName || !password || !email) {
        return res.status(400).send("they are required");
    }
    const newUser = new user({
        userName, password, email
    });
    await newUser.save();

    res.status(201).send(`registered succesful :)
        welcome ${newUser.userName} your email is ${newUser.email}`);
})

export default adminWay;