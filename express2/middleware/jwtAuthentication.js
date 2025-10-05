import jwt from 'jsonwebtoken'
import { user } from '../mongoose modules/userdatamodule.js'

export const verifyJWT = async (req,res,next)=>{
    try{
        const token =req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','');
        if(!token){
            return res.status(401).json({
                success:false,
                message:'access token is missing'
            })
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const foundUser = await user.findById(decodedToken._id).select("-password");
if(!foundUser){
    return res.status(401).json({
        success:false,
        message:"invalid token or user not found."
    });
}
    req.user=foundUser;
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