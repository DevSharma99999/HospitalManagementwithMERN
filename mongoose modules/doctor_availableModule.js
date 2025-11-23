import mongoose from "mongoose";

const docAvailableSchema = mongoose.Schema({
    
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor"
    },
    workingDays: {
        type: [Number],
        enum:[0,1,2,3,4,5,6],
        default:[]
    },
   availableTime:{
    type: [String],
        enum:["09:00-10:00","10:00-11:00","11:00-12:00","13:00-14:00","14:00-15:00","15:00-16:00"],
        default:[]
   }

}, { timestamps: true });

docAvailableSchema.index({ doctor_id: 1 }, { unique: true });
export const doctorAvailable = mongoose.model("doctorAvailable", docAvailableSchema)