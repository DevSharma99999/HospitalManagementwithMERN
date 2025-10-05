
import { doctor } from '../mongoose modules/doctormodule.js';
import { SpecilisationIN } from '../mongoose modules/SpecialistInmodel.js';
export const doctorDetails = async (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const medical_licence_number = req.body.medical_licence_number;
    const specialistIN = req.body.specialistIN;
    const qualifications = req.body.qualifications;
    const experience_years = parseInt(req.body.experience_years);
    const clinic_address = req.body.clinic_address;
    const consultancyFee = parseInt(req.body.consultancyFee);
    const phone = parseInt(req.body.phone);
    const password = (req.body.password);
    console.log(req.body);

     const specialtyName = specialistIN; 
   const missingStringField = !firstName || !lastName || !medical_licence_number || 
                               !specialistIN || !qualifications || !clinic_address || !password;
    
    const invalidNumberField = isNaN(experience_years) || isNaN(consultancyFee) || isNaN(phone);

    if (missingStringField || invalidNumberField) {
        return res.status(400).json({
            success: false,
            message: "all fields are required nott"
        });
    }
    try {
        const existingDoctor = await doctor.findOne({ medical_licence_number });
        if (existingDoctor) {
            return res.status(409).json({
                success: false,
                message: "doctor have already register with these inputs"
            });
        }
        const specialtyDocument = await SpecilisationIN.findOne({ name: specialtyName });
          if (!specialtyDocument) {
            return res.status(400).json({
                success: false,
                message: `Specialty '${specialistIN}' not found. Please choose a valid specialty.`
            });
        }

        const newDoctor = new doctor({
            firstName, lastName,
            medical_licence_number, 
            specialistID: specialtyDocument._id,
            specialistIN, qualifications,
            experience_years, clinic_address, consultancyFee, phone,password
        });
        console.log("hello");
        newDoctor.user_type = "doctor";
        await newDoctor.save();
        const accessToken = newDoctor.generateDoctorAccessToken();
        return res.status(201).json({
            success: true,
            message: "doctor registration successful",
            accessToken: accessToken
        })

    }
    catch (error) {
        console.error("Mongoose or Server Error while registering doctor:", error);
        return res.status(500).json({
            success: false,
            message: "server error in registeration of doctor"
        });
    }

}