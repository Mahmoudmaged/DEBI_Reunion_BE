import joi from 'joi'




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