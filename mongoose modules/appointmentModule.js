import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
    appointment_id: { type: Number, required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
    appointment_date: { type: Date, required: true },
    timeSlot: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid slot range.`
        }
    },
    reason: { type: String, trim: true, maxlength: 500, default: "No reason provided" },

    // 🆕 pending_payment = slot held, awaiting payment confirmation
    status: {
        type: String,
        enum: ["pending_payment", "scheduled", "cancelled", "expired"],
        default: "pending_payment"
    },

    // 🆕 Only set while status = "pending_payment". MongoDB TTL index below
    // auto-deletes the doc once this passes, freeing the slot with no cron needed.
    holdExpiresAt: { type: Date, default: null },

    // 🆕 Payment tracking
    paymentOrderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    paymentStatus: {
        type: String,
        enum: ["not_initiated", "created", "paid", "failed"],
        default: "not_initiated"
    },
    amountPaid: { type: Number, default: null }
}, { timestamps: true })

// Lock: only one active (held OR confirmed) appointment per doctor+date+slot at a time
appointmentSchema.index(
    { doctor_id: 1, appointment_date: 1, timeSlot: 1 },
    { unique: true, partialFilterExpression: { status: { $in: ["pending_payment", "scheduled"] } } }
)

// 🆕 TTL index: MongoDB's background task (runs ~every 60s) deletes any doc
// once holdExpiresAt has passed. Docs with holdExpiresAt = null are never touched.
appointmentSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 })

export const appointment = mongoose.model("appointment", appointmentSchema)