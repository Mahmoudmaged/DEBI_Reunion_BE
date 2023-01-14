import { homelessModel } from "../../../../DB/model/homeless.model.js"
import { paginate } from '../../../utils/pagination.js'
import { asyncHandler } from "../../../utils/errorHandling.js"



export const shelterMembers = asyncHandler(async (req, res) => {
    const { page, size } = req.query
    const { skip, limit } = paginate(page, size)
    let memberList = await find({
        model: homelessModel,
        filter: { shelterID: req.user._id },
        skip,
        limit,
        populate: [
            {
                path: 'policeStationID',
                select: '-password'
            },
            {
                path: 'updateBy',
                select: '-password'
            }
        ]
    })

    memberList.forEach((ele) => {
        ele.finderNationID = CryptoJS.AES.decrypt(ele.finderNationID,
            process.env.encKey).toString(CryptoJS.enc.Utf8)
    })
    return res.status(200).json({ message: "Done", memberList })
})