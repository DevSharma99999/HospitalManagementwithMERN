import { doctor } from "../mongoose modules/doctormodule.js"

export const doctordetails=async(req,res)=>{
    const _id=req.params.doctorId;
    if(!_id){
        return res.status(400).json({
            success:false,
            message:"Doctor ID is missing from the request path."
        });
    }
    try {
      const doctordetails=  await doctor.findOne({_id});
      if(!doctordetails)return res.status(400).json({
        sucesss:false,
        message:"doctor not found"
      });

      return res.status(200).json({
        success:true,
        message:"doctor details fatched",
        data:doctordetails
      })
    } catch (error) {
        console.log("error:",error);
        res.status(400).json({
            success:false,
            message:"error while fatching doctor details"
        });
    }

}