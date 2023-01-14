import { roles } from '../../middleware/auth.js'
const endPoint = {
    getAllUsers: [roles.Admin , roles.SuperAdmin],
    getAllAdmins: [roles.SuperAdmin],
    getAllShelter: [roles.SuperAdmin , roles.Admin],
    acceptAdmin: [roles.SuperAdmin],
    shelterMember:[roles.SuperAdmin , roles.Shelter]
}

export default endPoint