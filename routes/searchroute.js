import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { verifyJWT } from '../middleware/jwtAuthentication.js';
import { searchDoctor } from '../middleware/searchDoctor.js';
import { patientProfileAuth } from '../middleware/patientProfileAuth.js';

export const searchWay = express.Router();
// Assume the user query is passed via a query parameter: ?query=heart doctor
searchWay.get('/doctor-search', verifyJWT, patientProfileAuth, searchDoctor,
    (req, res, next) => {
        const doctors = res.locals.searchResults || [];

        // 2. Convert the dynamic data into a JSON string
        const jsonString = JSON.stringify(doctors);

        // 3. Define the path to your static HTML file
        const htmlPath = path.join(process.cwd(), 'public', 'html','searchResultDoctor.html');

        try {
            // Read the base HTML file content
            let htmlContent = fs.readFileSync(htmlPath, 'utf8');

            // 4. Inject the JSON data string into the HTML placeholder
            htmlContent = htmlContent.replace(
                '',
                `<script>window.DOCTOR_DATA = ${jsonString};</script>`
            );

            // 5. Send the dynamically modified HTML
            res.send(htmlContent);

        } catch (error) {
            console.error("HTML/File Read Error:", error);
            res.status(500).send("Error loading the search results page.");
        }
    });