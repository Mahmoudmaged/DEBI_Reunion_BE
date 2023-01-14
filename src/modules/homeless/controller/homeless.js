import { egyptCity } from "../../../../DB/model/egyptCistes.js";
import { homelessModel, homeLessStatus } from "../../../../DB/model/homeless.model.js";
import { userModel } from "../../../../DB/model/user.model.js";
import CryptoJS from 'crypto-js'
import { paginate } from "../../../utils/pagination.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { findByID, findOne } from "../../../../DB/DBMethods.js";
import cloudinary from "../../../utils/cloudinary.js";
import axios from "axios";
import { sendEmail } from "../../../utils/email.js";


export const addHomeLess = async (req, res, next) => {
    if (!req.file) {
        return next(new Error("Please upload an image", { cause: 400 }))
    } else {
        const { name, age, gender, description,
            foundLocation, foundTime, shelterID,
            finderName, finderNationID, finderPhone, finderEmail } = req.body;
        const record = await findOne({ model: homelessModel, filter: { name } })
        if (record) {
            return next(new Error("Already added", { cause: 400 }))
        } else {
            const city = egyptCity.find(ele => {
                return ele.governorate_name_en == foundLocation
            })
            if (!city) {
                return next(new Error("plz enter valid city", { cause: 400 }))
            } else {
                const shelter = await userModel.findById(shelterID)
                if (!shelter) {
                    res.status(400).json({ message: "In-valid shelter ID" })
                } else {

                    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "Reunion/Shelter" })
                    const cipherID = CryptoJS.AES.encrypt(finderNationID, process.env.encKey).toString();
                    const newHomeLess = new homelessModel({
                        name, age, gender, description,
                        imageURl: secure_url,
                        publicId: public_id,
                        foundLocation, foundTime, shelterID: shelter._id,
                        finderName, finderNationID: cipherID, finderPhone, finderEmail,
                        policeStationID: req.user._id
                    })
                    const saved = await newHomeLess.save()
                    if (saved) {


                        const result = await axios.post(`${process.env.AIURL}/genSaveEmbbedding`, {
                            headers: {
                                'content-type': 'application/json'
                            },
                            data: {
                                report_id: saved._id,
                                image_url: secure_url,
                                image_name: name,
                                gender:gender.toLowerCase(),
                                type: "homeless"
                            }
                        })

                        return res.status(201).json({ message: "Done", saved })
                    } else {
                        return next(new Error("fail", { cause: 400 }))
                    }

                }

            }

        }
    }

}

export const getAllHomeLess = async (req, res) => {
    try {
        const { page, size } = req.query
        const { skip, limit } = paginate(page, size)
        let homeLess = await homelessModel.find({ isDeleted: { $ne: true } }).limit(limit).skip(skip).populate([
            {
                path: 'policeStationID',
                select: '-password'
            },
            {
                path: 'shelterID',
                select: '-password'
            },
            {
                path: 'updateBy',
                select: '-password'
            }
        ])

        homeLess.forEach((ele) => {
            ele.finderNationID = CryptoJS.AES.decrypt(ele.finderNationID,
                process.env.encKey).toString(CryptoJS.enc.Utf8)
        })
        res.status(200).json({ message: "Done", homeLess })
    } catch (error) {
        res.status(500).json({ message: "Catch error" })
    }

}

export const getAllDeletedHomeless = async (req, res, next) => {
    try {
        const { page, size } = req.query
        const { skip, limit } = paginate(page, size)
        let homeLess = await homelessModel.find({ isDeleted: { $ne: false } }).limit(limit).skip(skip).populate([
            {
                path: 'policeStationID',
                select: '-password'
            },
            {
                path: 'shelterID',
                select: '-password'
            },
            {
                path: 'updateBy',
                select: '-password'
            }
        ])

        homeLess.forEach((ele) => {
            ele.finderNationID = CryptoJS.AES.decrypt(ele.finderNationID,
                process.env.encKey).toString(CryptoJS.enc.Utf8)
        })
        res.status(200).json({ message: "Done", homeLess })
    } catch (error) {
        res.status(500).json({ message: "Catch error" })
    }
}

export const getHomelessById = async (req, res, next) => {
    try {
        const { id } = req.params
        const homeless = await homelessModel.findById({ _id: id }).populate([
            {
                path: 'policeStationID',
                select: '-password'
            },
            {
                path: 'shelterID',
                select: '-password'
            },
            {
                path: 'updateBy',
                select: '-password'
            }
        ])
        if (!homeless) {
            res.status(400).json({ message: "In-valid homeless ID" })
        } else {
            homeless.finderNationID = CryptoJS.AES.decrypt(homeless.finderNationID,
                process.env.encKey).toString(CryptoJS.enc.Utf8)
            res.status(200).json({ message: "Done", homeless })
        }
    } catch (error) {
        res.status(500).json({ message: "Catch error" })
    }
}

export const softDeleteHomeLess = async (req, res, next) => {
    try {
        const { id } = req.params
        const homeLess = await homelessModel.updateOne({ _id: id }, {
            isDeleted: true,
            updateBy: req.user._id
        })
        homeLess.modifiedCount ? res.status(200).json({ message: "Done", homeLess })
            : res.status(400).json({ message: "In-valid homeLess ID" })
    } catch (error) {
        res.status(500).json({ message: "Catch error" })
    }
}

export const restoreHomeLess = async (req, res, next) => {
    try {
        const { id } = req.params
        const homeLess = await homelessModel.updateOne({ _id: id }, {
            isDeleted: false,
            updateBy: req.user._id
        })
        homeLess.modifiedCount ? res.status(200).json({ message: "Done", homeLess })
            : res.status(400).json({ message: "In-valid homeLess ID" })
    } catch (error) {
        res.status(500).json({ message: "Catch error" })
    }
}

export const changeHomeLessStatus = async (req, res, next) => {
    try {
        const { id, status } = req.body
        if (!homeLessStatus[status]) {
            res.status(400).json({ message: "In-valid status" })
        } else {
            const homeLess = await homelessModel.updateOne({ _id: id }, {
                status: homeLessStatus[status],
                updateBy: req.user._id
            })
            homeLess.modifiedCount ? res.status(200).json({ message: "Done", homeLess })
                : res.status(400).json({ message: "In-valid homeLess ID" })
        }
    } catch (error) {
        res.status(500).json({ message: "Catch error" })
    }
}



export const searchInHomeless = asyncHandler(async (req, res, next) => {

    if (!req.file) {
        return next(new Error("Please upload your pic", { cause: 404 }))
    } else {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Reunion/search'
        })

        const result = await axios.post(`${process.env.AIURL}/predict`, {
            headers: {
                'content-type': 'application/json'
            },
            data: {
                image: secure_url,
                publicId: public_id
            }
        })
        let allUsers;
        if (result.data.classProbabilities) {
            const classes = [];
            const matchedPercentage = []
            for (const ele of result.data.classProbabilities) {
                classes.push(ele.class)
                matchedPercentage.push(ele.Probability)
            }

            const matchedFace = await find({
                model: homelessModel,
                filter: {
                    class: { $in: classes }
                },
                populate: [{
                    path: "policeStationID"
                }, {
                    path: "shelterID"
                }]
            })
            allUsers = { users: matchedFace, matchedPercentage: matchedPercentage, flag: "FR" }
            return res.status(200).json({ message: "Done", data: allUsers })
        } else {
            const { name, startAge, endAge, gender } = req.body
            const users = await find({
                model: homelessModel,
                filter: {
                    $or: [
                        {
                            name
                        },
                        {
                            gender,
                            age: { $gte: startAge, $lte: endAge }
                        }
                    ]
                },
                populate: [{
                    path: "policeStationID"

                }]
            })
            allUsers = { users, flag: "NS" }
            return res.status(200).json({ message: "Done", data: allUsers })
        }
    }
})

export const searchInHomelessV2 = asyncHandler(async (req, res, next) => {

    if (!req.file) {
        return next(new Error("Please upload your pic", { cause: 404 }))
    } else {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Reunion/search'
        })

        const result = await axios.post(`${process.env.AIURL}/getImageMatches`, {
            headers: {
                'content-type': 'application/json'
            },
            data: {
                image_url: secure_url,
                // publicId: public_id,
                type: "homeless"
            }
        })
        console.log({ result: result?.data?.topMatches });
        let allUsers;
        if (result?.data?.topMatches) {
            const ids = [];
            const matchedPercentage = []
            for (const ele of result?.data?.topMatches) {
                ids.push(ele.report_id)
                matchedPercentage.push(ele.diffScore)
            }
            const matchedFace = await find({
                model: homelessModel,
                filter: {
                    _id: { $in: ids }
                },
                populate: [{
                    path: "policeStationID"
                }, {
                    path: "shelterID"
                }]
            })
            allUsers = { users: matchedFace, matchedPercentage: matchedPercentage, flag: "FR" }
            return res.status(200).json({ message: "Done", data: allUsers })
        } else {
            const { name, startAge, endAge, gender } = req.body
            const users = await find({
                model: homelessModel,
                filter: {
                    $or: [
                        {
                            name
                        },
                        {
                            gender,
                            age: { $gte: startAge, $lte: endAge }
                        }
                    ]
                },
                populate: [{
                    path: "policeStationID"

                }]
            })
            allUsers = { users, flag: "NS" }
            return res.status(200).json({ message: "Done", data: allUsers })
        }
    }
})


// 
export const searchInHomelessV22 = async (req, res, next) => {
    console.log("here");
    const { name, startAge, endAge, gender } = req.body
    if (!req.file) {
        return next(new Error("Please upload your pic", { cause: 404 }))
    } else {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Reunion/search'
        })

        const result = await axios.post(`${process.env.AIURL}/getImageMatches`, {
            headers: {
                'content-type': 'application/json'
            },
            data: {
                image_url: secure_url,
                // publicId: public_id,
                gender:gender.toLowerCase(),
                type: "homeless"
            }
        })
        console.log({ result: result?.data?.topMatches });
        let allUsers;
        if (result?.data?.topMatches) {
            const ids = [];
            const matchedPercentage = []
            const matchedFaces = []
            for (const ele of result?.data?.topMatches) {
                console.log(gender);
                const matchedFace = await findOne({
                    model: homelessModel,
                    filter: {
                        _id: ele.report_id,
                        gender,
                        age: { $gte: startAge, $lte: endAge }


                    },
                    populate: [
                        {
                            path: "policeStationID"
                        },
                        {
                            path: "shelterID"
                        }
                    ]
                })
                if (matchedFace) {
                    // matchedFace.reporterNationID = CryptoJS.AES.decrypt(matchedFace.reporterNationID,
                    //     process.env.encKey).toString(CryptoJS.enc.Utf8)
                    matchedFaces.push(matchedFace)
                    ids.push(ele.report_id)
                    matchedPercentage.push(`${ele.diffScore}`.substring(0,8))
                }
            }
            console.log(matchedFaces);
            allUsers = { users: matchedFaces, matchedPercentage: matchedPercentage, flag: "FR" }
            return res.status(200).json({ message: "Done", data: allUsers })
        } else {
            const { name, startAge, endAge, gender } = req.body
            const users = await find({
                model: homelessModel,
                filter: {
                    $or: [
                        {
                            name
                        },
                        {
                            gender,
                            age: { $gte: startAge, $lte: endAge }
                        }
                    ]
                },
                populate: [{
                    path: "policeStationID"
                }, {
                    path: "shelterID"
                }]
            })

            // users.forEach((ele) => {
            //     ele.reporterNationID = CryptoJS.AES.decrypt(ele.reporterNationID,
            //         process.env.encKey).toString(CryptoJS.enc.Utf8)
            // })
            allUsers = { users, flag: "NS" }
            return res.status(200).json({ message: "Done", data: allUsers })
        }

    }
}


// 


export const communicateToParentOfHomeless = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("Please upload an image", { cause: 404 }))
    } else {
        console.log(req.file.path);
        console.log(req.body);
        const { name, age, gender, description,
            foundLocation, foundTime, shelterID,
            finderName, finderNationID, finderPhone, finderEmail, destEmail } = req.body;
        const record = await findOne({ model: homelessModel, filter: { name } })
        if (record) {
            return next(new Error("Already added", { cause: 400 }))
        } else {
            const city = egyptCity.find(ele => {
                return ele.governorate_name_en == foundLocation
            })
            if (!city) {
                return next(new Error("plz enter valid city", { cause: 400 }))
            } else {
                const shelter = await userModel.findById(shelterID)
                if (!shelter) {
                    res.status(400).json({ message: "In-valid shelter ID" })
                } else {

                    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "Reunion/Shelter" })
                    const cipherID = CryptoJS.AES.encrypt(finderNationID, process.env.encKey).toString();
                    const newHomeLess = new homelessModel({
                        name, age, gender, description,
                        imageURl: secure_url,
                        publicId: public_id,
                        foundLocation, foundTime, shelterID: shelter._id,
                        finderName, finderNationID: cipherID, finderPhone, finderEmail,
                        policeStationID: req.user._id,
                        status: homeLessStatus.Matched,
                        reportID: req.params.id
                    })
                    const saved = await newHomeLess.save()
                    if (saved) {


                        const result = await axios.post(`${process.env.AIURL}/genSaveEmbbedding`, {
                            headers: {
                                'content-type': 'application/json'
                            },
                            data: {
                                report_id: saved._id,
                                image_url: secure_url,
                                image_name: name,
                                gender:gender.toLowerCase(),
                                type: "homeless"
                            }
                        })
                        const link = `${process.env.FEURL}#/displayMatchHomeless/${saved._id}`
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
                        <h1 style="padding-top:25px; color:#630E2B">Report Status</h1>
                        </td>
                        </tr>
                
                        <tr>
                        <td>
                        <p style="padding-top:10px; color:#630E2B">We have found matching result for your report please check it ASAP.</p>
                        </td>
                        </tr>
                
                        <tr>
                        <td>
                        <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Check result</a>
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
                        await sendEmail({ dest: destEmail, subject: "Report status", message })

                        return res.status(201).json({ message: "Done", saved })
                    } else {
                        return next(new Error("fail", { cause: 400 }))
                    }
                }
            }
        }
    }
})


export const getMatchedById = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const homeless = await findByID({
        model: homelessModel,
        filter: id,
        populate: [
            {
                path: 'policeStationID',
                select: '-password',
            },
            {
                path: 'shelterID',
                select: '-password',
            }
        ]
    })
    if (!homeless) {
        return next(new Error("In-valid homeless ID", { cause: 400 }))
    }
    return res.status(200).json({ message: "Done", homeless })
})
