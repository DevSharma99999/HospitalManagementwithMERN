import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({

    appointment_id: {
        type: Number,
        required: true
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patient",
        required: true
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true
    },
    appointment_date: {
        type: Date,
        required: true
    },
    timeSlot:  {
        type: String,
        enum:["09:00-10:00","10:00-11:00","11:00-12:00","13:00-14:00","14:00-15:00","15:00-16:00"],
        default:"09:00-10:00"
    },
    status: {
        type: String,
        enum: ["pending", "scheduled", "cancelled"],
        default: "pending"
    }
}, { timestamps: true })

export const appointment = mongoose.model("appointment", appointmentSchema)