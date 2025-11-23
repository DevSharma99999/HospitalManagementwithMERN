import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
// 💡 CRITICAL: Import the doctor model for fallback lookup
import { doctor } from '../mongoose modules/doctormodule.js'
import { patient } from '../mongoose modules/patientModule.js';

export const doctorverifyJWT = async (req, res, next) => {
    try {
        console.log("req.cookies:", req.cookies);
        console.log("Authorization header:", req.header('Authorization'));

        const token = req.cookies?.doctorAccessToken || req.header('Authorization')?.replace('Bearer ', '');
        console.log(token)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'access token is missing'
            })
        }
        console.log("--- TOKEN DEBUG INFO ---");
        console.log("Token received length:", token ? token.length : 0);
        console.log("Secret available:", !!process.env.ACCESS_TOKEN_SECRET);
        console.log("------------------------");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
// The ID stored in the token
        console.log(decodedToken);
        

        const userId = decodedToken._id;
        const userType = decodedToken.user_type;
        
        if (userType !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Access token belongs to a non-doctor account.'
            });
        }

        // 2. Look up the doctor (Assigning to the pre-declared 'foundUser')
     const   foundUser = await doctor.findById(userId); 
        console.log(foundUser);
        if (!foundUser) {
            return res.status(401).json({
                success: false,
                // This message now correctly applies to either model failing.
                message: "invalid token or user not found."
            });
        }

        // 💡 Ensure the user_type is correctly set for authorization checks
        // if (!foundUser.user_type) {
        //     console.error(`User ID ${userId} has no defined user_type. Defaulting to Patient.`);
        //     foundUser.user_type = 'Patient';
        // }

        req.user = foundUser;
        console.log(req.user,`Authenticated as: ${req.user.user_type} (ID: ${req.user._id})`);
        next();
    }
    catch (error) {
        console.log("jwt verification error:", error.message);
        return res.status(401).json({
            success: false,
            message: 'invalid or expired access token'
        })
    }
};

export const restrictTODoctor = (req, res, next) => {
    if (!req.user || req.user.user_type !== "doctor") {
        return res.status(403).json({
            success: false,
            message: "only doctor can perform this action."
        });
    }
    next();
};
