import { patient } from '../mongoose modules/patientModule.js';
import jwt from 'jsonwebtoken'
export const patientLoginAuth = async (req, res, next) => {
    //dob function
    const normalizeDobForQuery = (dobString) => {
        const startOfDay = new Date(dobString);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(dobString);
        endOfDay.setUTCHours(23, 59, 59, 999);

        return { start: startOfDay, end: endOfDay };
    };


    const { phone_number, dob } = req.body;
    if (!phone_number || !dob) {
        return res.status(400).json({
            success: false,
            message: "require dob and phone number."
        });
    }
    const { start: dobStart, end: dobEnd } = normalizeDobForQuery(dob);
try{
    const isExisting = await patient.findOne({ dob: { $gte: dobStart, $lte: dobEnd }, phone_number });
    if (!isExisting) {
        return res.status(404).json({
            success: false,
            message: "patient profile not found"
        });
    }
    const linkedUser = await patient.findById(isExisting._id).select("-email");
    console.log(linkedUser);
        if (!linkedUser) {
            console.error(`DB Integrity Error: Patient ${isExisting._id} linked to non-existent user.`);
            return res.status(500).json({
                success: false,
                message: "System authentication failure."
            });
        }
    else{
        const payload = { 
            _id: linkedUser._id, 
            email: linkedUser.email,
            user_type: linkedUser.user_type
        };
        
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        
        // Set the JWT cookie (using secure: false for localhost HTTP testing)
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false, 
            sameSite: 'Lax', 
            path: '/', 
            maxAge: 60 * 60 * 1000 // 1 hour
        });
        return res.status(200).json({
            success: true,
            message: `welcome back ${isExisting.firstName} `,
            redirectUrl:"/patient/activity" 
        });
    }
}
catch (error) {
        console.error("Patient Login Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during authentication." 
        });
    }
};
