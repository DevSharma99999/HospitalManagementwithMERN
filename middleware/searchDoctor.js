import express from "express";
import path from 'path';
import fs from 'fs';
import { verifyJWT } from "./jwtAuthentication.js";
import { doctor } from "../mongoose modules/doctormodule.js";
import { SpecilisationIN } from "../mongoose modules/SpecialistInmodel.js";
import { patientProfileAuth } from "./patientProfileAuth.js";

export const searchDoctor = async (req, res,next) => {
    try {
        console.log('helo');
        const userQuery = req.query.query;

        if (!userQuery) {
            res.locals.searchResults = [];
            return next();
        }

        // A. Create a Case-Insensitive Regular Expression
        const regex = new RegExp(userQuery, 'i');

        // B. Find Matching SpecialistIn IDs
        const matchingSpecialties = await SpecilisationIN.find({
            $or: [
                // Case 1: User typed the exact, official name
                { name: { $regex: regex } },

                // Case 2: User typed an informal keyword
                { keywords: { $regex: regex } }
            ]
        }).select('_id'); // We only need the ID to search for doctors

        console.log("Found Specialties:", matchingSpecialties.length, matchingSpecialties);
        
        const specialistIds = matchingSpecialties.map(spec => spec._id);
        
        // Removed: The problematic `if (specialistIds.length === 0 && !userQuery)` block
        // as this scenario is handled by the main search returning no doctors.
        
        console.log(specialistIds)

        // C. Search the Doctor Collection based on specialties and names
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

        // --- VITAL FIX: General Physician Fallback Logic ---
        if(!doctors || doctors.length === 0){ 
            console.log("No specific doctors found. Initiating General Physician fallback...");

            // 1. Find the Mongoose ObjectId for the 'General Physician' specialty.
            const generalSpecialty = await SpecilisationIN.findOne({ name: 'General Physician' }).select('_id');

            if (generalSpecialty) {
                // 2. Search doctors using the correct specialistID reference.
                const generalPhysicians = await doctor.find({ specialistID: generalSpecialty._id })
                    .populate('specialistID', 'name') // Populate specialty name for rendering
                    .limit(5);
                
                res.locals.searchResults = generalPhysicians;
                console.log("Fallback successful. General Physicians found:", generalPhysicians.length);
            } else {
                // Handle case where 'General Physician' specialty does not exist in the DB
                res.locals.searchResults = []; 
                console.log("Fallback failed: 'General Physician' specialty ID not found in SpecilisationIN collection.");
            }

            return next();
        }
        
        // If doctors were found by the main search
        res.locals.searchResults = doctors;
        return next();

    } catch (error) {
        console.error("Doctor search error:", error);
        res.locals.searchResults = [];
        return next(); 
    }
};
