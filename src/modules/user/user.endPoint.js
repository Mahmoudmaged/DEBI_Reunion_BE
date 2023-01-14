import { roles } from "../../middleware/auth.js";



export const endPoint = {

    profile:[roles.User , roles.Admin , roles.Shelter , roles.SuperAdmin ]
}