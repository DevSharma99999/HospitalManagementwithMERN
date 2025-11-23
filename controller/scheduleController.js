// Example in '../controller/scheduleController.js'
import { doctorAvailable } from "../mongoose modules/doctor_availableModule.js";
import { doctor } from "../mongoose modules/doctormodule.js";
import { patient } from "../mongoose modules/patientModule.js";
import { appointment } from "../mongoose modules/appointmentModule.js";

    // Add this utility function to convert Date to YYYY-MM-DD string
const toYYYYMMDD = (date) => {
    // If the Mongoose date is already a simple date (no time component), 
    // using UTC methods ensures the date stays the intended calendar day.
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
import mongoose from "mongoose";

/**
 * Transforms the doctor's general availability and specific bookings into a 7-day schedule grid.
 @param {object} availability- The Mongoose document containing doctor_id, workingDays (Array of day numbers 0-6), and availableTime (Array of strings like "09:00-10:00").
@param {Array} bookings
@returns {Array}
   - Array of appointment Mongoose documents (must include appointment_date and timeSlot).
  An array of schedule objects for the next 7 days, suitable for client-side rendering.
 */

const transformToWeeklyGrid = (availability, bookings) => {
    // If no general availability is set, return an empty array.
    if ( !availability || !availability.workingDays || availability.workingDays.length === 0) {
        return [];
    }
    
    // Map booked slots for quick lookup: Key is "YYYY-MM-DD|TimeSlot"
    const bookedSlotsMap = new Map();
    bookings.forEach(booking => {
        const key = `${toYYYYMMDD((booking.appointment_date))}|${booking.timeSlot}`;
        bookedSlotsMap.set(key, true);
    });

    const weeklySchedule = [];
    const now = new Date(); 
     const today = new Date(Date.UTC(
        now.getUTCFullYear(), 
        now.getUTCMonth(), 
        now.getUTCDate() // Use getUTCDate to ensure we get the date of the IST day
    ));


    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
       currentDate.setUTCDate(today.getUTCDate() + i); 
        
        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday (Matches standard JS getDay())
        const currentDayNumber = currentDate.getDay(); 
       
        const dateString = toYYYYMMDD(currentDate);
      
        // Check if the current day is one of the doctor's working days
        if (availability.workingDays.includes(currentDayNumber)) {
           
            // Iterate over all available time slots
            availability.availableTime.forEach(slot => {
                const key = `${dateString}|${slot}`;
                
                const slotEntry = {
                    date: dateString,
                    dayOfWeek: currentDayNumber,
                    timeSlot: slot,
                    // Check if this specific date/slot combination is booked
                    status: bookedSlotsMap.has(key) ? 'booked' : 'available'
                };
                
                weeklySchedule.push(slotEntry);
            });
        }
    }
    // console.log(weeklySchedule);
    return weeklySchedule;
};



export const getWeeklySchedule = async (req, res) => {
    const doctorId = req.params.doctorId;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ success: false, message: "Invalid Doctor ID format." });
    }
    const now = new Date();
    const startOfTodayUTC = new Date(Date.UTC(
        now.getFullYear(), 
        now.getMonth(), 
        now.getDate()
    ));
    try {
        // 1. Fetch Doctor Name (for display on the client)
        const doctorProfile = await doctor.findById(doctorId, 'firstName lastName');

        // 2. Fetch the base weekly availability (from doctorAvailable module)
        const availability = await doctorAvailable.findOne({ doctor_id: doctorId });
        
        // 3. Fetch all current and future booked appointments for this doctor (from appointment module)
        const bookings = await appointment.find({ 
            doctor_id: doctorId,
            appointment_date: { $gte: startOfTodayUTC } // Only future appointments
        });
        console.log(availability, bookings);
        // 4. Transform and combine the data (e.g., build a structure showing available/booked slots for the next 7 days)
        const weeklyScheduleData = transformToWeeklyGrid(availability, bookings); // 🚨 You need this function

        if (!doctorProfile) {
             return res.status(404).json({ success: false, message: "Doctor not found." });
        }
        console.log(weeklyScheduleData);
        return res.status(200).json({
            success: true,
            message: "Weekly schedule loaded.",
            data: {
                doctorName: `${doctorProfile.firstName} ${doctorProfile.lastName}`,
                schedule: weeklyScheduleData // This must match what your client-side renderer expects
            }
        });

    } catch (error) {
        console.error("Error fetching weekly schedule:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching schedule data." });
    }
};