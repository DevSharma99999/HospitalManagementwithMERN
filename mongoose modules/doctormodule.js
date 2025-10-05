import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
   doctor_id: {
      type: String,
      unique: true,
      default: uuidv4
   },
   firstName: {
      type: String,
      required: true
   },
   lastName: {
      type: String,
      required: true
   },
   medical_licence_number: {
      type: String,
      required: true,
      unique: true
   },
   specialistIN: {
      type: String,
      enum: ['Cardiology', 'Neurology', 'Dermatology'],
      required: true
   },
   specialistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecilisationIN",
      required:true
   },
   qualifications: {
      type: String
   },
   experience_years: {
      type: Number
   },
   clinic_address: {
      type: String,
      required: true
   },
   consultancyFee: {
      type: Number,
      required: true
   },
   profile_picture_url: {
      type: String //cloud url
   },
   phone: {
      type: Number,
      required: true,
   },
   user_type: {
      type: String,
      default: "user"
   },
   password: {
      type: String,
      required: true,
      select: false
   },
   is_profile_complete: {
      type: Boolean,
      default: false
   }
}, { timestamps: true }
)
doctorSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next();
   this.password = await bcrypt.hash(this.password, 10);
   next();
})
doctorSchema.methods.generateDoctorAccessToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         medical_licence_number: this.medical_licence_number,
         user_type: this.user_type
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
   );
};
doctorSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}
export const doctor = mongoose.model("doctor", doctorSchema);