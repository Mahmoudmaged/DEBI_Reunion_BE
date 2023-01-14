import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import *  as validators from './admin.validation.js'
import * as adminController from './controller/admin.js'
import endPoint from './admin.endPoint.js'
const router = Router()



//========================Satart-Admin===========================

//get Users
// router.get("/admin/users", auth(endPoint.getAllUsers), adminController.allUsers)
// router.get("/admin/user/:id",validation(validators.allUsers) ,auth(endPoint.getAllUsers), adminController.getUser)

//get adminsauth
router.get("/adminList", auth(endPoint.getAllAdmins), adminController.allAdmins)
router.get("/shelterList", auth(endPoint.getAllShelter), adminController.shelterList)
router.get("/stationList", adminController.stationList)
router.get("/joinRequest", auth(endPoint.acceptAdmin), adminController.getJoinRequest)
router.patch("/:id/approve",validation(validators.allUsers),auth(endPoint.acceptAdmin), adminController.approveAdminRequest)
router.patch("/:id/reject",validation(validators.allUsers),auth(endPoint.acceptAdmin), adminController.rejectAdminRequest)

router.get("/:id",validation(validators.allUsers) , auth(endPoint.getAllUsers), adminController.getAdmin)

//change admin role
router.patch("/:id/role", validation(validators.allUsers) , auth(endPoint.getAllUsers), adminController.changeRole)
router.patch("/:id/block", validation(validators.allUsers), auth(endPoint.getAllUsers), adminController.blockAccount)
router.patch("/:id/unBlock", validation(validators.allUsers),  auth(endPoint.getAllUsers), adminController.activateAccount)
//========================End-Admin===========================






export default router