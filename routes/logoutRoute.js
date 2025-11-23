import express from 'express';

export const logoutWay = express.Router();

logoutWay.post('/logout', (req, res) => {
    // 1. Clear the HTTP-only access token cookie
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Match the security flags used during setting
        sameSite: 'Lax', // Match the sameSite flag used during setting
        path: '/',       // Match the path used during setting
    });
console.log("heloo");
    // 2. Send a success response and the redirect URL
    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
        redirectUrl: "/login" // Redirect to the login page after logout
    });
});