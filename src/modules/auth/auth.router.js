import { Router } from 'express'
import * as  validators from './auth.validation.js'
import {validation} from '../../middleware/validation.js'
import * as registration from './controller/registration.js'
import { auth } from '../../middleware/auth.js'
import endPoint from './auth.endPoint.js'
const router = Router()


//signup
router.post("/signup",validation(validators.signup) ,registration.signup)
//refresh  email 
router.get('/refreshEmail/:id',validation(validators.refreshEmail), registration.refreshEmail)
//confirm email
router.get("/confirmEmail/:token", validation(validators.confirmEmail), registration.confirmEmail)
//login 
router.post("/login",validation(validators.login) ,registration.login)
//logout
router.patch("/logout", auth(endPoint.logout), registration.logOut)

//send forget code 
router.patch("/sendCode", validation(validators.sendCode), registration.sendCode)
router.patch("/forgetPassword", validation(validators.forgetPassword), registration.forgetPassword)


export default router