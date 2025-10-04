import {Router} from 'express'
import {verifyJWT , restrictToDoctor} from '../middleware/jwtAuthentication.js'
import { addAvailability,getMyAvailability } from '../controller/doctorAvailability.js'

const router = Router();

router.route("/availability").post(verifyJWT , restrictToDoctor , addAvailability)
.get(verifyJWT, restrictToDoctor, getMyAvailability);


export default router;