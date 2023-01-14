import joi from 'joi'

const forgetPassword = {
    body: joi.object().required().keys({
        email: joi.string().email().required(),
        code: joi.number().required(),
        newPassword: joi.string().required().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
        cPassword: joi.string().valid(joi.ref('newPassword')).required(),
    })
}

const sendCode = {
    body: joi.object().required().keys({
        email: joi.string().email().required()
    })
}
const signup = {
    body: joi.object().required().keys({
        userName: joi.string().required().pattern(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{1,20}$/)),
        email: joi.string().email().required(),
        password: joi.string().required().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
        cPassword: joi.string().valid(joi.ref('password')).required(),
        nationalID:joi.number().required(),
        role:joi.string().required(),
        phone:joi.number().required(),
        location:joi.string().required()
    })
}


const login = {

    body: joi.object().required().keys({

        email: joi.string().email().required(),
        password: joi.string().required().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),

    })
}


const confirmEmail = {

    params: joi.object().required().keys({
        token: joi.string().required(),
    })
}


const refreshEmail = {

    params: joi.object().required().keys({
        token: joi.string().min(24).max(24).required(),
    })
}


export {
    signup,
    login,
    confirmEmail,
    forgetPassword,
    refreshEmail,
    sendCode
}