import mongoose from "mongoose";

const specialistInSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    category: {
        type: String
    },
    keywords: {
        type: [String],
        default: [],
        index: true
    }
});
export const SpecilisationIN = mongoose.model("SpecilisationIN", specialistInSchema);