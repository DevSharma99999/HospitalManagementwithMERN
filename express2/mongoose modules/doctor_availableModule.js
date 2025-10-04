import mongoose from "mongoose";

const docAvailableSchema = mongoose.Schema({
    availability_id: {
        type: Number,
        unique: true
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor"
    },
    dayOfWeek: {
        type: Number,
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    }

}, { timestamps: true })

export const doctorAvailable = mongoose.model("doctorAvailable", docAvailableSchema)