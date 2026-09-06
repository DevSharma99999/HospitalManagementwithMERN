import express from 'express';

export const logoutWay = express.Router();

logoutWay.post('/logout', (req, res) => {
    const wasDoctor = !!req.cookies?.doctorAccessToken;
    const wasPatient = !!req.cookies?.accessToken;

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
    };

    // 🔧 clear BOTH — a doctor session and a patient session should never
    // coexist, but clearing both unconditionally is the safest guarantee
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('doctorAccessToken', cookieOptions);

    const redirectUrl = wasDoctor ? "/doctor-login" : "/patient/login";

    return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
        redirectUrl
    });
});