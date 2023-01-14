import { find, findByID, findOne } from "../../../../DB/DBMethods.js";
import { userModel } from "../../../../DB/model/user.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";




export const profile = 
    async (req, res, next) => {
        const user = await findByID({
            model: userModel,
            filter: req.user._id
        })
        return  res.status(200).json({message:"Done" , user})
    }
