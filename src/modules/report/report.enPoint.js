import { roles } from '../../middleware/auth.js'
export const endPoint = {
    addReport: [roles.Admin, roles.SuperAdmin]
}

