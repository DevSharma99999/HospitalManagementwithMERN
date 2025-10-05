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
    reason_of_visit: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "scheduled", "cancelled"],
        default: "pending"
    }
}, { timestamps: true })

export const appointment = mongoose.model("appointment", appointmentSchema)