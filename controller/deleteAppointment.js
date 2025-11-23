import { appointment } from "../mongoose modules/appointmentModule.js";
export const deleteAppointment = async (req,res,next)=>{
    const appointmentId = req.params.appointmentId;
    console.log(appointmentId);
    if (!appointmentId) {
        return res.status(400).json({
            success:false,  
            message :"Appointment ID is required"
        });
    }
  try {
    const deletedDoc = await appointment.findByIdAndDelete(appointmentId);
    console.log(deletedDoc)
    if (!deletedDoc) {
      console.log('No document found with that id');
      return res.status(400).json({
        success:false,
        message :"not able to cancel appointment"
      });
    }
    console.log('Deleted document:', deletedDoc);
    return res.status(200).json({
        success:true,
        message:"appointment cancelled succesfully",
        redirectUrl:'/patient/appointments',
        data: deletedDoc
    }) 
  } 
  catch (err) {
    console.error('Error deleting document:', err);
    return res.status(500).json({ success: false, message: "Server error during cancellation." });
  }

};