import joi from 'joi'


export const allUsers = {

    params: joi.object().required().keys({
        id: joi.string().min(24).max(24).required(),
    })
}