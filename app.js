
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import path from "path";
import { fileURLToPath } from 'url';
import { PatientHomeWay } from './routes/userHome.js';
// import userway from './routes/userSignup.js';
// import adminWay from './routes/control.userregister.js';
import wrongWay from './routes/page 404.js';
import homeWay from './routes/home.js';
import cookieParser from 'cookie-parser';
import { patientregisterWay } from './routes/patientForm.js';
import { patientFormfile } from './routes/petientFormFile.js';
import { searchFileWay } from './routes/searchdoctorfile.js';
import { searchWay } from './routes/searchroute.js';
// import { login } from './routes/login.js';

// import { patientDashboardWay } from './routes/doctorDashBoardRoute.js';
import { bookingWay } from './routes/patientbooking.js';
import { patientbookingWay } from './routes/patientbookingWay.js';
import { patientLoginFileWay } from './routes/patientloginFile.js';
import { patientLoginWay } from './routes/patientLoginAuth.js';
import { logoutWay } from './routes/logoutRoute.js';
import { patientDashboardWay } from './routes/patientbookingWay.js';
import { doctorDashboardWay } from './routes/doctorDashBoardRoute.js';
// import { loginsuccessful } from './routes/loginsuccesful.js';
import { doctorloginfile } from './routes/doctorloginfile.js';
import { doctorloginsuccessful } from './routes/doctorLogin.js';
import { doctorRegisterfile } from './routes/doctorRegisterfile.js';
import { doctorform } from './routes/doctorRegisterForm.js';
import { airoutes } from './routes/genairoutes.js';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 🛑 CORRECT PATH CONFIGURATION
app.set('view engine','ejs');
// Looks for the 'views' folder right next to app.js (the root of the project)
app.set('views', path.join(__dirname, 'views')); 
console.log(app.get('views'));
console.log('app initializing');
// app.use(cors({
//   credentials: true
// }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(homeWay);
// app.use(userway);
// app.use(adminWay);
// app.use(login);
// app.use(loginsuccessful);
app.use(airoutes);
app.use(doctorloginfile);
app.use(doctorloginsuccessful);
app.use(doctorRegisterfile);
app.use(doctorform);
app.use(searchFileWay);
app.use(searchWay);
app.use(patientFormfile);
app.use(patientregisterWay);
app.use(PatientHomeWay);
app.use(logoutWay);
app.use(patientLoginFileWay);
app.use(patientLoginWay);
app.use(bookingWay);
app.use(doctorDashboardWay);
app.use(patientbookingWay);
app.use(patientDashboardWay)
app.use(wrongWay);

const p=process.env.port || 3000;
mongoose.connect(process.env.url).then(() => {
  console.log("mongoose connected succesfully");
  app.listen(process.env.port, () => {
    console.log(`http://localhost:${p}`);
 });
}).catch(err => {
  console.log("errr", err);
  process.exit(1);
});