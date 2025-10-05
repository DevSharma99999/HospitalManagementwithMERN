import mongoose from "mongoose";

const patientSchema = mongoose.Schema({

    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
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
        required:true
    },
    phone_number:{
        type:Number,
        required:true
    },
    address:{
        type:String
    },
    emergency_contact_no:{
        type:Number,
        default: 102
    },

},{timestamps:true})

export const patient = mongoose.model("patient",patientSchema)