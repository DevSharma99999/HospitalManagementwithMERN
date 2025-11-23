import mongoose from "mongoose";
import { patient } from "../mongoose modules/patientModule.js";    

export const patientProfileAuth = async(req,res,next)=>{
    const _id = req.user ?  req.user._id :req.body._id;
    console.log("user hello");
    if(!_id){
        // return res.redirect(301,"/login");
        return res.status(401).json({
            success:false,
            message:"authentication required to proceed.",
            redirectUrl:"/login"
        });
    }
    try {
        const userObjectId = new mongoose.Types.ObjectId(_id);

        const existingPatient = await patient.findOne({_id:userObjectId});

        if(!existingPatient){
            return res.status(403).json({
                success:false,
                message:"patient profile is incomplete. please register",
                redirect:"/patient"
            });
        }
        req.patient_id = existingPatient._id;
        req.patient = existingPatient;
        console.log("akk");
        next();

    } catch (error) {
        console.error("Profile Check Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error during profile verification." });
    }
} 