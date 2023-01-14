import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import * as shelterController from './controller/shelter.js'
import endPoint from './shelter.endPoint.js'
const router = Router()



router.get("/memberList",
    auth(endPoint.shelterMember),
    shelterController.shelterMembers)



export default router