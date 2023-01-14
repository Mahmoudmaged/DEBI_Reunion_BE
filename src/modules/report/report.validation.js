import joi from 'joi'




export const clintAddReport = {
    body: joi.object().required().keys({
        name: joi.string().required(),
        age: joi.number().required(),
        gender: joi.string().valid('Male', 'Female').required(),
        lostLocation: joi.string().required(),
        lostTime: joi.string().required(),
        description: joi.string(),
        reporterName: joi.string().required(),
        reporterEmail: joi.string().email().required(),
        reporterNationalID: joi.number().required(),
        reporterPhone: joi.number().required(),
        policeStationID: joi.string().min(24).max(24).required()
    })
}

export const getClintReport ={
    params: joi.object().required().keys({
        reportId: joi.string().max(24).min(24).required(),
        reporterNationalID: joi.number().required(),
    })
}

export const checkID = {

    params: joi.object().required().keys({
        id: joi.string().min(24).max(24).required(),
    })
}


export const changeReportStatus = {

    body: joi.object().required().keys({
        id: joi.string().min(24).max(24).required(),
        status: joi.string().required(),

    })
}