// import express from "express";
// const adminWay = express.Router();
// import { user } from "../mongoose modules/userdatamodule.js";
// import mongoose from "mongoose";
// import jwt from 'jsonwebtoken';
// import { patient } from "../mongoose modules/patientModule.js";

// adminWay.post("/SignUp-succesful", async (req, res, next) => {
//     const userName = (req.body.userName);
//     const password = (req.body.password);
//     const email = (req.body.email);
//     if (!userName || !password || !email) {
//         return res.status(400).send("they are required");
//     }
//     const existing = await user.findOne({ email });
//     if (existing) {
//         return res.status(400).json({ success: false, message: "Email already in use." });
//     }
//     const newUser = new user({
//         userName, password, email
//     });
//     await newUser.save();
//     const payload = { _id: newUser._id, email: newUser.email, user_type: newUser.user_type };
//     const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: '1h',
//     });
//     res.cookie('accessToken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production', // only over HTTPS
//         sameSite: 'Lax',
//         path: '/',
//         maxAge: 60 * 60 * 1000 // 1 hour
//     });
//     console.log("hellot",token);
//    return res.status(201).json({
//     success: true,
//     message: `Registration successful. Welcome ${newUser.userName}!`,
//     // 💡 Add the redirect URL here
//     redirectUrl: "/user/home" // Change to your intended destination
// });
// })

// export default adminWay;