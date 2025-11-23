import { user } from "../mongoose modules/userdatamodule.js";
import jwt from "jsonwebtoken";
export const loginAuth = async (req, res, next) => {
    const userName = req.body.userName;
    const password = req.body.password;
    if (!userName || !password) {
        return res.status(400).json({
            success: false,
            message: "all field are required."
        });
    }
    try {
        const findUser = await user.findOne({ userName: userName });
        if (!findUser) {
            return res.status(401).json({
                success: false,
                message: "user not found with this username."
            });
        }
        const checkPassword = await findUser.isPasswordCorrect(password);
        if (checkPassword) {
            const payload = {
                _id: findUser._id,
                email: findUser.email,
                user_type: findUser.user_type
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
            console.log("login as a user successfull.",token)
            return res.status(200).json({
                success: true,
                message: `welcome back, ${userName}! Logging in...`,
                redirectUrl: "/user/home"
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: " server error in login"
        });
    }

}

