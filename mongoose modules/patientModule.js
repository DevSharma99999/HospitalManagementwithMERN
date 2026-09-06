import mongoose from "mongoose";
import bcrypt from "bcrypt";

const patientSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    phone_number: { type: Number, required: true, unique: true },
    address: { type: String },
    emergency_contact_no: { type: Number },
    profile_complete: { type: String, enum: ["yes", "no"], default: "no" },
    email: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    medicalHistory: { type: String, required: true },
    user_type: { type: String, enum: ["Patient", "Doctor"], default: "Patient" },

    // 🆕 password-based auth
    password: { type: String, required: true, select: false }, // select:false so it's never returned by default
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

// 🆕 Hash password before saving (mirrors your doctor schema's pattern)
patientSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

patientSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const patient = mongoose.model("patient", patientSchema)