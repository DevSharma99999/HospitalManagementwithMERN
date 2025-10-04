import { user } from "../mongoose modules/userdatamodule.js";

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
            console.log("login as a user successfull.")
            return res.status(200).json({
                success: true,
                message: "welcome back"
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

