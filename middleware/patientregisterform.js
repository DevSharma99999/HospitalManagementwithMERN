import { patient } from '../mongoose modules/patientModule.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
export const patientRegister = async (req, res, next) => {
    const { firstName, lastName, dob, gender, phone_number, address,email,reason,medicalHistory } = req.body;
    // console.log(`Received user_id: ${user_id}. Type: ${typeof user_id}.`);
    if (!firstName || !medicalHistory || !lastName || !email || !reason || !dob || !gender || !phone_number) {
        return res.status(400).json({
            success: false,
            message: "Missing required patient fields."
        });
    }

    try {
       const existingPatient = await patient.findOne({ email });

        if (existingPatient) {
            console.log(`Manual check found existing email: ${email}`);
            // Return 409 Conflict status since the resource already exists
            return res.status(409).json({
                success: false,
                error: 'Conflict',
                message: `This email (${email}) is already registered. Please check the email or log in if you already have an account.`,
                field: 'email'
            });
        }
        const newpatient = new patient({
            firstName,
            lastName,
            dob: new Date(dob),
            gender,
            phone_number: parseInt(phone_number),
            address,
            reason,
            email,
            medicalHistory
        });
        console.log(newpatient);
        await newpatient.save();
        const payload = { _id: newpatient._id, phone_number: newpatient.phone_number, lastName: newpatient.lastName };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // only over HTTPS
            sameSite: 'Lax',
            path: '/',
            maxAge: 60 * 60 * 1000 // 1 hour
        });
        return res.status(201).json({
            success: true,
            message: "patient registraion is successful",
            redirectUrl: "/patient/activity"
        });
    }
    catch (error) {
        console.error("Patient Registration Error:", error);
        // 💡 FIX: Define errorMessage based on the type of error
        let errorMessage;
         if (error.code && error.code === 11000) {
            
            // Extract the duplicated field name from keyPattern
            const key = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[key];

            // 409 Conflict: Inform the user that the unique data already exists.
            console.error(`Duplicate key error: Field '${key}' with value '${value}' already exists.`);
            return res.status(409).json({
                error: 'Conflict',
                message: `This ${key.replace('_', ' ')} (${value}) is already registered. Please check the number or log in if you already have an account.`,
                field: key
            });
        }
        if (error.name === 'ValidationError') {
            errorMessage = `Mongoose Validation Failed: ${error.message}`;
        } else if (error.name === 'CastError') {
            // This CastError should only happen if user_id is passed incorrectly from a script
            errorMessage = `Invalid ID format provided: ${error.path} must be a valid ID.`;
        } else {
            errorMessage = "Internal server error during profile creation.";
        }
        res.status(500).json({ success: false, message: errorMessage });
    }

}