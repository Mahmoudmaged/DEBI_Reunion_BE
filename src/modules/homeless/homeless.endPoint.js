import { roles } from '../../middleware/auth.js'
const endPoint = {

    addHomeLess: [roles.Admin, roles.SuperAdmin],
    getAllHomeLess: [roles.Admin, roles.SuperAdmin]

}

export default endPoint