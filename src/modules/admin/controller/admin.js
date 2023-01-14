import { userModel } from "../../../../DB/model/user.model.js"
import { roles } from '../../../middleware/auth.js'
import { sendEmail } from "../../../utils/email.js"
import { asyncHandler } from "../../../utils/errorHandling.js"
import { paginate } from '../../../utils/pagination.js'
import { find, findOne, findOneAndDelete, findOneAndUpdate } from '../../../../DB/DBMethods.js'
export const allUsers = asyncHandler(async (req, res, next) => {
    const { page, size } = req.query
    const { skip, limit } = paginate(page, size)
    const userList = await find({
        model: userModel,
        filter: {
            role: roles.User
        },
        limit,
        skip
    })
    return res.status(200).json({ message: "Done", userList })

})

export const getUser = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const user = await findOne({
        model: userModel,
        filter: {
            role: roles.User,
            _id: id
        }
    })
    return res.status(200).json({ message: "Done", user })

})

export const allAdmins = asyncHandler(async (req, res, next) => {

    const { page, size } = req.query
    const { skip, limit } = paginate(page, size)
    const adminList = await find({
        model: userModel,
        filter: {
            role: {
                $ne: roles.User,
                $ne: roles.SuperAdmin
            }
        },
        skip,
        limit
    })
    return res.status(200).json({ message: "Done", adminList })

})


export const shelterList = asyncHandler(async (req, res, next) => {

    // const { page, size } = req.query
    // const { skip, limit } = paginate(page, size)
    const shelterList = await find({
        model: userModel,
        filter: {
            role: roles.Shelter,
        },
        skip: 0,
        limit: 100
    })
    return res.status(200).json({ message: "Done", shelterList })

})

export const stationList = asyncHandler(async (req, res, next) => {

    const stationList = await find({
        model: userModel,
        filter: {
            role: { $in: [roles.Admin , roles.SuperAdmin] },
        },
        skip: 0,
        limit: 100
    })
    return res.status(200).json({ message: "Done", stationList })

})

export const getAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const admin = await findOne({
        mode: userModel,
        filter: {
            role: { $ne: roles.SuperAdmin },
            _id: id
        }
    })
    return res.status(200).json({ message: "Done", admin })
})

export const changeRole = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const { cRole } = req.body
    if (!roles[cRole]) {
        return next(new Error("Sorry but this role not available", { cause: 400 }))
    } else {
        const admin = await findOneAndUpdate({
            model: userModel,
            filter: {
                role: { $ne: roles.SuperAdmin },
                _id: id
            },
            data: {
                role: roles.cRole
            }
        })
        if (!admin) {
            return next(new Error("In-valid account", { cause: 400 }))
        } else {



            const emailMessage = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td width="100%">
        <img width="100px" src="https://res.cloudinary.com/dz5onutvd/image/upload/v1672870947/family_wkjpyi.png"/>
    </td>
    </tr>
    <tr>
    <td>
    <p style="text-align: right;">
    <a href="${process.env.FEURL}/#/" target="_blank" style="text-decoration: none;">View In Website</a>
    </p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Account Status</h1>
    </td>
    </tr>

    <tr>
    <td>
    <h4>Super admin have change your privileges to ${roles[cRole]}</h4>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`
            await sendEmail({ dest: admin.email, message: emailMessage })
            return res.status(200).json({ message: "Done", admin })
        }
    }

})

export const blockAccount = asyncHandler(async (req, res, next) => {

    const { id } = req.params

    const admin = await findOneAndUpdate({
        model: userModel, filter: {
            role: { $ne: roles.SuperAdmin },
            _id: id
        },
        data: {
            blocked: true
        }
    })
    if (!admin) {
        return next(new Error("In-valid account", { cause: 400 }))
    } else {



        const emailMessage = `<!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                <style type="text/css">
                body{background-color: #88BDBF;margin: 0px;}
                </style>
                <body style="margin:0px;"> 
                <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                <tr>
                <td>
                <table border="0" width="100%">
                <tr>
                <td width="100%">
                    <img width="100px" src="https://res.cloudinary.com/dz5onutvd/image/upload/v1672870947/family_wkjpyi.png"/>
                </td>
                </tr>
                <tr>
                <td>
                <p style="text-align: right;">
                <a href="${process.env.FEURL}/#/" target="_blank" style="text-decoration: none;">View In Website</a>
                </p>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                <tr>
                <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                </td>
                </tr>
                <tr>
                <td>
                <h1 style="padding-top:25px; color:#630E2B">Account Status</h1>
                </td>
                </tr>
            
                <tr>
                <td>
                <h4>Sorry but SuperAdmin has blocked your account</h4>
                </td>
                </tr>
            
            
                <tr>
                <td>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                <tr>
                <td>
                <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                </td>
                </tr>
                <tr>
                <td>
                <div style="margin-top:20px;">
            
                <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                
                <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                </a>
                
                <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                </a>
            
                </div>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </body>
                </html>`
        await sendEmail({ dest: admin.email, message: emailMessage })
        return res.status(200).json({ message: "Done" })
    }
})

export const activateAccount = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const admin = await findOneAndUpdate(
        {
            model: userModel,
            filter: {
                role: { $ne: roles.SuperAdmin },
                _id: id
            },
            data: {
                blocked: false
            }
        })

    if (!admin) {
        return next(new Error("In-valid account", { cause: 400 }))
    } else {

        const emailMessage = `<!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                <style type="text/css">
                body{background-color: #88BDBF;margin: 0px;}
                </style>
                <body style="margin:0px;"> 
                <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                <tr>
                <td>
                <table border="0" width="100%">
                <tr>
                <td width="100%">
                    <img width="100px" src="https://res.cloudinary.com/dz5onutvd/image/upload/v1672870947/family_wkjpyi.png"/>
                </td>
                </tr>
                <tr>
                <td>
                <p style="text-align: right;">
                <a href="${process.env.FEURL}/#/" target="_blank" style="text-decoration: none;">View In Website</a>
                </p>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                <tr>
                <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                </td>
                </tr>
                <tr>
                <td>
                <h1 style="padding-top:25px; color:#630E2B">Account Status</h1>
                </td>
                </tr>
            
                <tr>
                <td>
                <h4>Congratulations SuperAdmin has reactivate your account  your account</h4>

                </td>
                </tr>
            
            
                <tr>
                <td>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                <tr>
                <td>
                <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                </td>
                </tr>
                <tr>
                <td>
                <div style="margin-top:20px;">
            
                <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                
                <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                </a>
                
                <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                </a>
            
                </div>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </body>
                </html>`
        await sendEmail({ dest: admin.email, message: emailMessage })
        return res.status(200).json({ message: "Done" })
    }

})

export const getJoinRequest = asyncHandler(async (req, res, next) => {

    const admin = await find({
        model: userModel,
        filter: {
            approved: false,
            confirmEmail: true
        }
    })

    return res.status(200).json({ message: "Done", admin })

})

export const approveAdminRequest = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const admin = await findOneAndUpdate({
        model: userModel,
        filter: {
            _id: id
        }, dataL: {
            approved: true
        }
    })
    if (!admin) {
        return next(new Error("In-valid account", { cause: 400 }))
    } else {

        const emailMessage = `<!DOCTYPE html>
                                <html>
                                <head>
                                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                                <style type="text/css">
                                body{background-color: #88BDBF;margin: 0px;}
                                </style>
                                <body style="margin:0px;"> 
                                <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                                <tr>
                                <td>
                                <table border="0" width="100%">
                                <tr>
                                <td width="100%">
                                    <img width="100px" src="https://res.cloudinary.com/dz5onutvd/image/upload/v1672870947/family_wkjpyi.png"/>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                <p style="text-align: right;">
                                <a href="${process.env.FEURL}/#/" target="_blank" style="text-decoration: none;">View In Website</a>
                                </p>
                                </td>
                                </tr>
                                </table>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                                <tr>
                                <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                                <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                                </td>
                                </tr>
                                <tr>
                                <td>
                                <h1 style="padding-top:25px; color:#630E2B">Account Status</h1>
                                </td>
                                </tr>
                            
                                <tr>
                                <td>
                                <h4>Congratulations SuperAdmin has approved your Request</h4>
                                </td>
                                </tr>
                            
                            
                               
                                </table>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                                <tr>
                                <td>
                                <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                                </td>
                                </tr>
                                <tr>
                                <td>
                                <div style="margin-top:20px;">
                            
                                <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                                
                                <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                                </a>
                                
                                <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                                </a>
                            
                                </div>
                                </td>
                                </tr>
                                </table>
                                </td>
                                </tr>
                                </table>
                                </body>
                                </html>`
        await sendEmail({ dest: admin.email, message: emailMessage })
        return res.status(200).json({ message: "Done" })
    }

})

export const rejectAdminRequest = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const admin = await findOneAndDelete({
        model: userModel,
        filter: {
            _id: id
        }
    })
    if (!admin) {
        return next(new Error("In-valid account", { cause: 400 }))
    } else {
        const emailMessage = `<!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                <style type="text/css">
                body{background-color: #88BDBF;margin: 0px;}
                </style>
                <body style="margin:0px;"> 
                <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
                <tr>
                <td>
                <table border="0" width="100%">
                <tr>
                <td width="100%">
                    <img width="100px" src="https://res.cloudinary.com/dz5onutvd/image/upload/v1672870947/family_wkjpyi.png"/>
                </td>
                </tr>
                <tr>
                <td>
                <p style="text-align: right;">
                <a href="${process.env.FEURL}/#/" target="_blank" style="text-decoration: none;">View In Website</a>
                </p>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                <tr>
                <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
                <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
                </td>
                </tr>
                <tr>
                <td>
                <h1 style="padding-top:25px; color:#630E2B">Account Status</h1>
                </td>
                </tr>
            
                <tr>
                <td>
                <h4>We are sorry  to inform you that the  SuperAdmin had been rejected  your request </h4>

                </td>
                </tr>
            
            
               
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                <tr>
                <td>
                <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
                </td>
                </tr>
                <tr>
                <td>
                <div style="margin-top:20px;">
            
                <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
                
                <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                </a>
                
                <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                </a>
            
                </div>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </body>
                </html>`
        await sendEmail({ dest: admin.email, message: emailMessage })
        return res.status(200).json({ message: "Done" })
    }
})