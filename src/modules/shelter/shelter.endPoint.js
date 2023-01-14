import { roles } from '../../middleware/auth.js'
const endPoint = {
    getAllUsers: [roles.Admin , roles.SuperAdmin],
    getAlladmins: [roles.SuperAdmin],
    acceptAdmin: [roles.SuperAdmin],
    shelterMember:[roles.SuperAdmin , roles.Shelter]


}

export default endPoint