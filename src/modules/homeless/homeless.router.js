import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import { myMulter, fileValidation } from '../../utils/multer.js'
import * as homelessController from './controller/homeless.js'
import * as validators from './homeless.validation.js'
import endPoint from './homeless.endPoint.js'
const router = Router()


router.post("/status", validation(validators.changeReportStatus), auth(endPoint.getAllHomeLess), homelessController.changeHomeLessStatus)

router.post("/",
    myMulter(fileValidation.image).single('image'),
    auth(endPoint.addHomeLess), homelessController.addHomeLess)


router.get("/", auth(endPoint.getAllHomeLess), homelessController.getAllHomeLess)
// router.get("/search", homelessController.searchInHomeless)
router.post("/search", 
myMulter(fileValidation.image).single('image'),
homelessController.searchInHomelessV22)

router.post("/communicateToParentOfHomeless/:id",
    myMulter(fileValidation.image).single('image'),
    auth(endPoint.getAllHomeLess),
    homelessController.communicateToParentOfHomeless)

router.get("/:id", homelessController.getMatchedById)

// router.get("/deleted", auth(endPoint.getAllHomeLess), homelessController.getAllDeletedHomeless)

// router.get("/:id", validation(validators.checkID), auth(endPoint.getAllHomeLess), homelessController.getHomelessById)

// router.patch("/:id/delete", validation(validators.checkID), auth(endPoint.getAllHomeLess), homelessController.softDeleteHomeLess)
// router.patch("/:id/restore", validation(validators.checkID), auth(endPoint.getAllHomeLess), homelessController.restoreHomeLess)

export default router