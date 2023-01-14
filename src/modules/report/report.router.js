import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { validation } from '../../middleware/validation.js'
import { endPoint } from './report.enPoint.js'
import { myMulter, fileValidation } from '../../utils/multer.js'
import * as reportController from './controller/report.js'
import * as validators from './report.validation.js'
const router = Router()

router.get("/generateEmbeddingReports", reportController.generateEmbeddingReport)

router.post("/ch/status",
    validation(validators.changeReportStatus),
    auth(endPoint.addReport),
    reportController.changeReportStatus)


router.post("/",
    auth(endPoint.addReport),
    myMulter(fileValidation.image).single('image'),
    reportController.addReport)

router.post("/clintAddReport",
    myMulter(fileValidation.image).single('image'),
    validation(validators.clintAddReport),
    reportController.clintReport)

router.get("/getReportById/:reportId/:reporterNationalID",
    validation(validators.getClintReport),
    reportController.getClintReport)

router.get("/", auth(endPoint.addReport), reportController.getAllReport)
router.get("/deleted", auth(endPoint.addReport), reportController.getAllDeletedReport)

router.get("/byUser", reportController.userGetHisReport)
router.get("/:id", validation(validators.checkID), auth(endPoint.addReport), reportController.getReportById)



router.patch("/:id/delete", validation(validators.checkID), auth(endPoint.addReport), reportController.softDeleteReport)
router.patch("/:id/restore", validation(validators.checkID), auth(endPoint.addReport), reportController.restoreReport)


// router.post('/search', myMulter(fileValidation.image).single('image'), reportController.searchInReport)
router.post('/search', myMulter(fileValidation.image).single('image'), reportController.searchInReportV2)


router.post('/testModel', myMulter(
    fileValidation.image).single('image'),
    reportController.testModel)


router.post("/volunteer",
    myMulter(fileValidation.image).single('image'),
    reportController.getDetails)


router.post("/volunteer/v2",
    reportController.getDetailsV2)


export default router