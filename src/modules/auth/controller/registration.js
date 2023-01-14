import { userModel } from '../../../../DB/model/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js'
import { sendEmail } from '../../../utils/email.js';
import { roles } from '../../../middleware/auth.js';
import { findByIdAndUpdate, findOne, findOneAndUpdate, updateOne, findByID } from '../../../../DB/DBMethods.js';
import { asyncHandler } from '../../../utils/errorHandling.js';

export const signup = asyncHandler(async (req, res, next) => {

    const { email, password, userName, role, nationalID, phone, location } = req.body;
    if (!roles[role]) {
        return next(new Error("In-valid Role", { cause: 400 }))
    } else {
        const user = await findOne({
            model: userModel,
            filter: { email }
        });
        if (!user) {
            const hashPassword = bcrypt.hashSync(password, parseInt(process.env.saltRound))
            const cipherID = CryptoJS.AES.encrypt(nationalID.toString(), process.env.encKey).toString();
            const newUser = new userModel({
                role, email,
                password: hashPassword,
                userName,
                nationalID: cipherID,
                phone,
                location
            })
            const savedUser = await newUser.save()
            const emailToken = jwt.sign({ id: savedUser._id }, process.env.emailToken, { expiresIn: (60 * 60 * 48) })
            const link = `${req.protocol + '://' + req.headers.host + process.env.BASEURL + '/auth/confirmEmail/' + emailToken}`
            const link2 = `${req.protocol + '://' + req.headers.host + process.env.BASEURL + '/auth/refreshEmail/' + savedUser._id}`

            // const message = `
            // <a href='${link}'>Please Follow me to activate your email </a>
            // <br>
            // <a href='${link2}'>re-send confirmationEmail</a>
            // `
            const message = `<!DOCTYPE html>
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
            <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
            </td>
            </tr>
    
            <tr>
            <td>
            </td>
            </tr>
    
            <tr>
            <td>
            <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
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


            await sendEmail({ dest: savedUser.email, subject: "ConfirmEmail", message })
            return res.status(201).json({ message: "Done" })
        } else {
            return next(new Error("Email exist", { cause: 400 }))
        }
    }

})

//plz set  better view

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    const decoded = jwt.verify(token, process.env.emailToken)
    if (!decoded) {
        return next(new Error("In-valid token", { cause: 400 }))
    } else {
        const user = await findByID({
            filter: decoded.id,
            model: userModel,
            select: "confirmEmail"
        })
        if (!user) {
            return next(new Error("In-valid token id", { cause: 404 }))
        } else {
            if (user.confirmEmail) {
                return res.status(302).redirect(process.env.FEURL)
            } else {
                await updateOne({
                    model: userModel,
                    filter: { _id: user._id },
                    data: { confirmEmail: true },
                    options: { new: true }
                })
                return res.status(302).redirect(process.env.FEURL)
            }
        }
    }
}
)

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log({ email, password });
    const user = await findOne({
        model: userModel,
        filter: { email }
    });

    if (user) {
        if (user.confirmEmail &&
            (
                (user.role == 'User' && user.approved == false) ||
                (user.role != 'User' && user.approved == true)
            ) && !user.blocked
        ) {
            const match = bcrypt.compareSync(password, user.password);
            if (match) {
                var token = jwt.sign({
                    id: user._id,
                    isLoggedIn: true
                }, process.env.tokenSignature);
                await updateOne(
                    {
                        model: userModel,
                        filter: { _id: user._id },
                        data: { online: true },
                        options: { new: true }
                    })
                return res.status(200).json({ message: "Done", token });
            } else {
                return next(new Error("invalid Password", { cause: 403 }))
            }
        } else {
            return next(new Error("Please Confirm your email", { cause: 403 }))
        }

    } else {
        return next(new Error("Not register user", { cause: 404 }))
    }

}

export const refreshEmail = asyncHandler(async (req, res, next) => {

    const { id } = req.params;
    const user = await findById({ model: userModel, filter: id, select: "confirmEmail email" })
    if (!user) {
        return next(new Error("in-valid account", { cause: 400 }))
    } else {
        if (user.confirmEmail) {
            return next(new Error("already confirmed", { cause: 400 }))
        } else {
            const token = jwt.sign({ id: user._id }, process.env.emailToken, { expiresIn: 60 * 60 * 48 })
            const link = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}`
            const link2 = `${req.protocol + '://' + req.headers.host + process.env.BASEURL + '/auth/refreshEmail/' + user._id}`

            const message = `<!DOCTYPE html>
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
                <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
                </td>
                </tr>
        
                <tr>
                <td>
                </td>
                </tr>
        
                <tr>
                <td>
                <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
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

            await sendEmail({ dest: user.email, subject: "ConfirmEmail", message })
            return res.status(200).json({ message: "Done" })
        }
    }


})
export const logOut = asyncHandler(async (req, res, next) => {

    await findByIdAndUpdate({
        filter: req.user._id,
        data: {
            online: false,
            lastSeen: Date.now()
        }
    });
    return res.status(200).json({ message: "Done" })
})

export const sendCode = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await findOne({
        model: userModel,
        filter: { email }
    });
    if (!user) {
        return next(new Error("in-valid email", { cause: 404 }))
    }
    const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
    await userModel.findByIdAndUpdate(user._id, { code })

    const message = `<!DOCTYPE html>
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
    <h1 style="padding-top:25px; color:#630E2B">Reset Password</h1>
    </td>
    </tr>

    <tr>
    <td>
    <h4>Reset Code : ${code}</h4>
    </td>
    </tr>


    <tr>
    <td>
    <p>Enter this code to  reset your account password</p>
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
    await sendEmail({ dest: user.email, subject: "Forget password", message: message })
    return res.status(200).json({ message: "Done" })
})

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { code, email, newPassword } = req.body;
    console.log(newPassword);
    const user = await findOne({
        model: userModel,
        filter: { email }
    });
    if (!user) {
        return next(new Error("in-valid email", { cause: 404 }))
    } else {
        if (user.code != code) {
            return next(new Error("In-valid auth code", { cause: 400 }))
        } else {
            const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.saltRound))
            await findOneAndUpdate({
                model: userModel,
                filter: { _id: user._id },
                data: { password: hashedPassword, code: "" },
                options: { new: true }
            })
            return res.status(200).json({ message: "Done" })
        }
    }

})
