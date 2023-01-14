import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { endPoint } from './user.endPoint.js'
import * as userController from './controller/user.js'
const router = Router()

router.get("/profile" , auth(endPoint.profile) ,  userController.profile)

export default router