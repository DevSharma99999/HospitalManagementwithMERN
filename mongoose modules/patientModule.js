import mongoose from "mongoose";

const patientSchema = mongoose.Schema({

   
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum: ['Male', 'Female', 'Other']
    },
    phone_number:{
        type:Number,
        required:true,
        unique:true
    },
    address:{
        type:String
    },
    emergency_contact_no:{
        type:Number
    },
    profile_complete:{
        type:String,
        enum:["yes","no"],
        default:"no"
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    reason:{
        type:String,
        required:true
    },
    medicalHistory:{
        type:String,
        required:true
    },
    user_type: {
    type: String,
    enum: ["Patient", "Doctor"],
    default: "Patient"
  }

},{timestamps:true})

export const patient = mongoose.model("patient",patientSchema)