import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

import userway from './routes/userSignup.js';
import adminWay from './routes/control.userregister.js';
import wrongWay from './routes/page 404.js';
import homeWay from './routes/home.js';
import { login } from './routes/login.js';
import { loginsuccessful } from './routes/loginsuccesful.js';
import { doctorloginfile } from './routes/doctorloginfile.js';
import { doctorloginsuccessful } from './routes/doctorLogin.js';
import { doctorRegisterfile } from './routes/doctorRegisterfile.js';
import { doctorform } from './routes/doctorRegisterForm.js';
const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(homeWay);
app.use(userway);
app.use(adminWay);
app.use(login);
app.use(loginsuccessful);
app.use(doctorloginfile);
app.use(doctorloginsuccessful);
app.use(doctorRegisterfile);
app.use(doctorform);
app.use(wrongWay);

mongoose.connect(process.env.url).then(() => {
  console.log("mongoose connected succesfully");
  app.listen(process.env.port, () => {
    console.log(`http://localhost:${process.env.port}`);
  });
}).catch(err => {
  console.log("errror", err);
  process.exit(1);
});