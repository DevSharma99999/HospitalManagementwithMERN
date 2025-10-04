import express from 'express';
import path from 'path';
const userway = express.Router();
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


userway.get("/SignUp", (req, res, next) => {
    console.log(req.url, req.method);
    res.sendFile(path.join(__dirname, '../', 'utils', 'registration.html'));
});
export default userway;