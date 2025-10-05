import mongoose from "mongoose";

const specialistInSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    category: {
        type: string
    },
    keywords: {
        type: [String],
        default: [],
        index: true
    }
});
export const SpecialistIn = mongoose.model("SpecialistIn", specialistInSchema);