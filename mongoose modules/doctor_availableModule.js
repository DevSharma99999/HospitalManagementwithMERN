import mongoose from "mongoose";

const timeStringValidator = {
    validator: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
    message: props => `${props.value} is not a valid HH:MM time.`
};

const workingHourSchema = new mongoose.Schema({
    day: { type: Number, enum: [0,1,2,3,4,5,6], required: true }, // 0=Sun ... 6=Sat
    startTime: { type: String, required: true, validate: timeStringValidator },
    endTime: { type: String, required: true, validate: timeStringValidator }
}, { _id: false });

const breakSchema = new mongoose.Schema({
    day: { type: Number, enum: [0,1,2,3,4,5,6], required: true },
    startTime: { type: String, required: true, validate: timeStringValidator },
    endTime: { type: String, required: true, validate: timeStringValidator }
}, { _id: false });

const docAvailableSchema = mongoose.Schema({
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },

    // Multiple windows per day supported (e.g. morning + evening clinic)
    workingHours: { type: [workingHourSchema], default: [] },

    // Optional excluded windows per day (lunch break etc.)
    breaks: { type: [breakSchema], default: [] },

    slotDurationMinutes: { type: Number, required: true, min: 5, default: 20 },
    bufferMinutes: { type: Number, required: true, min: 0, default: 10 }
}, { timestamps: true });

docAvailableSchema.index({ doctor_id: 1 }, { unique: true });
export const doctorAvailable = mongoose.model("doctorAvailable", docAvailableSchema)