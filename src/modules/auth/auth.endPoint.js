import { roles } from '../../middleware/auth.js'

const endPoint = {
    logout:[roles.SuperAdmin , roles.Admin , roles.HR , roles.User],
    sendCode:[roles.SuperAdmin , roles.Admin , roles.HR , roles.User],
    forgetPassword:[roles.SuperAdmin , roles.Admin , roles.HR , roles.User]
}

export default endPoint