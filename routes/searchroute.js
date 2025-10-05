import express from "express";
import { doctor } from "../mongoose modules/doctormodule.js";
import { SpecilisationIN } from "../mongoose modules/SpecialistInmodel.js";

export const searchWay = express.Router();
// Assume the user query is passed via a query parameter: ?query=heart doctor
searchWay.get('/doctor-search', async (req, res) => {
    try {
        console.log('helo');
        const userQuery = req.query.query;

        if (!userQuery) {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        // A. Create a Case-Insensitive Regular Expression
        // This handles all variations: 'Cardio', 'cardio', 'cArDiO'
        const regex = new RegExp(userQuery, 'i');

        // B. Find Matching SpecialistIn IDs (Handling ALL Search Cases)
        // The query checks the user's text against THREE fields:
        const matchingSpecialties = await SpecilisationIN.find({
            $or: [
                // Case 1: User typed the exact, official name (or close to it)
                { name: { $regex: regex } },

                // Case 2: User typed an informal keyword ('stomach', 'bone', 'skin')
                { keywords: { $regex: regex } }

                // You could also add Case 3 here for 'category' if you implemented it
            ]
        }).select('_id'); // We only need the ID to search for doctors

        console.log("Found Specialties:", matchingSpecialties.length, matchingSpecialties);
        // If no specialty matches the query, we can still proceed to search doctors
        // who match the query by name (Step C below).
        const specialistIds = matchingSpecialties.map(spec => spec._id);
        if (specialistIds.length === 0) {
    return res.json([]);
        }


        // C. Search the Doctor Collection
        const doctors = await doctor.find({
            $or: [
                // Match 1: Doctor's specialty ID matches the found IDs
                { specialistID: { $in: specialistIds } },

                // Match 2: Doctor's name (first or last) directly matches the query
                { firstName: { $regex: regex } },
                { lastName: { $regex: regex } }
            ]
        })
            .populate('specialistID', 'name')
            .limit(20) // Always limit results for performance
            .exec();
        console.log("Final Doctors Found:", doctors.length, doctors);
        res.json(doctors);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error during search.' });
    }
});