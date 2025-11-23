import jwt from 'jsonwebtoken'
import { patient } from '../mongoose modules/patientModule.js';

export const verifyJWT = async (req,res,next)=>{
    try{
        console.log("req.cookies:", req.cookies);
console.log("Authorization header:", req.header('Authorization'));

        const token =req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','');
        if(!token){
            return res.status(401).json({
                success:false,
                message:'access token is missing'
            })
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const foundUser = await patient.findById(decodedToken._id).select("-email");
if(!foundUser){
    return res.status(401).json({
        success:false,
        message:"invalid token or user not found."
    });
}
    req.user=foundUser;
    console.log(req.user);
    next();
    }
    catch(error){
        console.log("jwt verification error",error.message);
        return res.status(401).json({
            success:false,
            message:'invalid or expired access token'
        })
    }
};

export const restrictTODoctor =(req ,res ,next)=>{
    if(!req.user || req.user.user_type !== "Doctor"){
        return res.status(403).json({
            success:false,
            message: "only doctor can perform this action."
        });
    }
    next();
};