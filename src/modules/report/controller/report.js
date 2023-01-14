import { reportModel, reportStatus } from "../../../../DB/model/report.model.js"
import CryptoJS from 'crypto-js'
import { paginate } from "../../../utils/pagination.js"
import axios from 'axios'
import cloudinary from "../../../utils/cloudinary.js"
import { asyncHandler } from "../../../utils/errorHandling.js"
import { find, findOne, updateOne, findByID, findOneAndUpdate } from "../../../../DB/DBMethods.js"
import { userModel } from "../../../../DB/model/user.model.js"
import { sendEmail } from "../../../utils/email.js"



function decryptFun(data) {
    return new Promise((r, j) => {
        console.log(data);
        var bytes = CryptoJS.AES.decrypt(data, process.env.encKey);
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        return r(originalText)
    })
}


export const getDetails = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("Please upload an image", { cause: 400 }))
    } else {
        const { gender, description, location, date } = req.body;
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'Reunion/report/volunteer' })
        const result = await axios.post(`${process.env.AIURL}/getImageMatches`, {
            headers: {
                'content-type': 'application/json'
            },
            data: {
                image_url: secure_url,
                // publicId: public_id,
                type: "report"
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

            const matchedFace = await findOneAndUpdate({
                model: reportModel,
                filter: {
                    _id: { $in: ids }
                },
                data: {
                    volunteer: {
                        $push: {
                            gender,
                            description,
                            location,
                            date,
                            imageURl: secure_url,
                            publicId: public_id
                        }
                    }
                }
            })
            console.log({ matchedFace });
            if (!matchedFace) {
                return next(new Error("Can't find matching result", { cause: 400 }))
            } else {
                return res.status(200).json({ message: "Done" })
            }
        }
    }
})



export const getDetailsV2 = asyncHandler(async (req, res, next) => {

    const { gender, description, location, date, secure_url, public_id } = req.body;
    // const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'Reunion/report/volunteer' })
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

        const matchedFace = await findOneAndUpdate({
            model: reportModel,
            filter: {
                class: { $in: classes }
            },
            data: {
                volunteer: {
                    $push: {
                        gender,
                        description,
                        location,
                        date,
                        imageURl: secure_url,
                        publicId: public_id
                    }
                }
            }
        })
        console.log({ matchedFace });
        if (!matchedFace) {
            return next(new Error("Can't find matching result", { cause: 400 }))
        } else {
            return res.status(200).json({ message: "Done" })
        }
    }

})



export const addReport = async (req, res, next) => {

    if (!req.file) {
        return next(new Error("Please upload an image", { cause: 400 }))
    } else {
        const { name, age, gender, description,
            lostLocation, lostTime, reporterName,
            reporterNationID, reporterPhone,
            reporterEmail } = req.body;
        const report = await findOne({ model: reportModel, filter: { name } })
        if (report) {
            return next(new Error("Already added", { cause: 400 }))
        } else {

            var cipherID = CryptoJS.AES.encrypt(reporterNationID.toString(), process.env.encKey).toString();
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'Reunion/report' })
            const newReport = new reportModel({
                name,
                age,
                gender,
                description,
                lostLocation,
                lostTime,
                imageURl: secure_url,
                publicId: public_id,
                reporterName,
                reporterNationID: cipherID,
                reporterPhone,
                reporterEmail,
                policeStationID: req.user._id
            })
            const savedReport = await newReport.save()
            if (savedReport) {


                const result = await axios.post(`${process.env.AIURL}/genSaveEmbbedding`, {
                    headers: {
                        'content-type': 'application/json'
                    },
                    data: {
                        report_id: savedReport._id,
                        image_url: secure_url,
                        image_name: name,
                        gender:gender.toLowerCase(),
                        type: "report"
                    }
                })
                console.log({ result });
                if (reporterEmail) {


                    const link = `${process.env.FEURL}#/displayReport/${savedReport._id}`


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
                    <h3 style="padding-top:10px; color:#630E2B">  ${savedReport.status} </h3>
                    </td>
                    </tr>
            
                    <tr>
                    <td>
                    <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Check your report</a>
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
                    await sendEmail({ dest: reporterEmail, subject: "Report", message })
                }
                return res.status(201).json({ message: "Done", savedReport })
            } else {
                return next(new Error("Fail to add", { cause: 400 }))

            }

        }


    }

}



// 
const StaticData = [
    {
        report_id: "63b9978a28c4ce1b1ac8f232",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673107337/Reunion/report/eixmklclfzjv9uzzl3jq.jpg",
        image_name: "Adam",
        gender:"male",
        type: "report"
    },
    {
        report_id: "63b997d928c4ce1b1ac8f239",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673107417/Reunion/report/dcfhqbt65av8kpcgj9av.jpg",
        image_name: "Alex",
        gender:"male",

        type: "report"
    },


    {
        report_id: "63b9983a28c4ce1b1ac8f240",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673107513/Reunion/report/aqyukzgraucjldtlurqs.jpg",
        image_name: "Smias",
        gender:"male",

        type: "report"
    },

    {
        report_id: "63b99a3d28c4ce1b1ac8f263",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673108029/Reunion/report/qlqbjxk5xkk3xriwogq9.jpg",
        image_name: "Mostafa",
        gender:"male",
        type: "report"
    },


    {
        report_id: "63b998ac28c4ce1b1ac8f247",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673107735/Reunion/report/per9wfe6m9nqvmhpjcmr.jpg",
        image_name: "Rose",
        gender:"female",
        type: "report"
    },


    {
        report_id: "63b9999e28c4ce1b1ac8f255",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673107869/Reunion/report/jyvjsxu4djrfnghavt50.jpg",
        image_name: "Rebeca",
        gender:"female",
        type: "report"
    },

    {
        report_id: "63b999fa28c4ce1b1ac8f25c",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673107962/Reunion/report/bibcy0ed37knc1zweeqy.jpg",
        image_name: "Amel",
        gender:"female",
        type: "report"
    },


    {
        report_id: "63b9991a28c4ce1b1ac8f24e",
        image_url: "https://res.cloudinary.com/dz5onutvd/image/upload/v1673107735/Reunion/report/per9wfe6m9nqvmhpjcmr.jpg",
        image_name: "Rana",
        gender:"female",
        type: "report"
    }
]

export const generateEmbeddingReport = async (req, res, next) => {
    for (const report of StaticData) {
        await axios.post(
            `${process.env.AIURL}/genSaveEmbbedding`,
            {
                headers: {
                    'content-type': 'application/json'
                },
                data: report
            })

    }
    res.json({message:"Done"})

}





export const clintReport = asyncHandler(async (req, res, next) => {

    if (!req.file) {
        return next(new Error("Please upload an image", { cause: 400 }))
    } else {
        const { name, age, gender, description,
            lostLocation, lostTime, reporterName,
            reporterNationalID, reporterPhone, policeStationID,
            reporterEmail } = req.body;
        const report = await findOne({ model: reportModel, filter: { name } })
        if (report) {
            return next(new Error("Already added", { cause: 400 }))
        } else {

            const checkStation = await findByID({
                model: userModel,
                filter: policeStationID
            })
            if (!checkStation) {
                return next(new Error("Please select valid police station", { cause: 400 }))

            }
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'Reunion/report' })
            console.log(reporterNationalID);
            const cipherID = CryptoJS.AES.encrypt(reporterNationalID, process.env.encKey).toString();
            const newReport = new reportModel({
                name,
                age,
                gender,
                description,
                lostLocation,
                lostTime,
                imageURl: secure_url,
                publicId: public_id,
                reporterName,
                reporterNationID: cipherID,
                reporterPhone,
                reporterEmail,
                policeStationID
            })
            const savedReport = await newReport.save()
            if (savedReport) {

                const result = await axios.post(`${process.env.AIURL}/genSaveEmbbedding`, {
                    headers: {
                        'content-type': 'application/json'
                    },
                    data: {
                        report_id: savedReport._id,
                        image_url: secure_url,
                        image_name: name,
                        gender:gender.toLowerCase(),
                        type: "report"
                    }
                })

                console.log({ result });
                if (reporterEmail) {
                    const link = `${process.env.FEURL}#/displayReport/${savedReport._id}`


                    const messageLink = `<!DOCTYPE html>
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
                    <h3 style="padding-top:10px; color:#630E2B">  ${savedReport.status} </h3>
                    </td>
                    </tr>
            
                    <tr>
                    <td>
                    <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Check your report</a>
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
                    await sendEmail({ dest: reporterEmail, subject: "Report", message: messageLink })
                }
                return res.status(201).json({ message: "Done", savedReport })
            } else {
                return next(new Error("Fail to add", { cause: 400 }))

            }
        }


    }

}
)

export const getClintReport = asyncHandler(async (req, res, next) => {
    const { reportId, reporterNationalID } = req.params
    const report = await findByID({
        model: reportModel,
        filter: reportId,
        populate: [
            {
                path: "policeStationID",
                select: "userName"
            }
        ]
    })

    if (!report) {
        return next(new Error("In-valid report ID", { cause: 404 }))
    } else {
        const result = await decryptFun(report.reporterNationID)
        if (result != reporterNationalID) {
            return next(new Error("In-valid reporter National ID", { cause: 403 }))
        }
        const convObj = report.toObject()
        convObj.reporterNationID = result
        return res.status(200).json({ message: "Done", data: convObj })
    }

})

// export const updateReport = async (req, res, next) => {
//     try {
//         if (!req.file) {
//             res.json({ message: "Please upload an image" })
//         } else {
//             const imageURl = `${req.finalDestination}/${req.file.filename}`
//             const { name, age, gender, description,
//                 lostLocation, lostTime, reporterName,
//                 nationalID, reporterPhone,
//                 reporterEmail } = req.body
//             const report = await reportModel.findOne({ name })
//             if (report) {
//                 res.json({ message: "Already added", report })
//             } else {
//                 const cipherID = await CryptoJS.AES.encrypt(nationalID, process.env.encKey).toString();
//                 const newReport = new reportModel({
//                     name,
//                     age,
//                     gender,
//                     description,
//                     lostLocation,
//                     lostTime,
//                     imageURl,
//                     reporterName,
//                     reporterNationID: cipherID,
//                     reporterPhone,
//                     reporterEmail,
//                     policeStationID: req.user._id
//                 })
//                 const savedReport = await newReport.save()
//                 savedReport ? res.status(201).json({ message: "Done", savedReport }) :
//                     res.status(400).json({ message: "Fail to add" })
//             }
//         }

//     } catch (error) {
//         res.status(500).json({ message: "Catch error" })
//     }
// }


export const getAllReport = async (req, res, next) => {

    const { page, size } = req.query
    const { skip, limit } = paginate(page, size)


    let report = await find({
        model: reportModel,
        filter: {
            isDeleted: { $ne: true }
        },
        skip: skip,
        limit: limit,
        populate: [
            {
                path: 'policeStationID',
                select: '-password'
            }
        ]
    })

    report.forEach((ele) => {
        ele.reporterNationID = CryptoJS.AES.decrypt(ele.reporterNationID,
            process.env.encKey).toString(CryptoJS.enc.Utf8)
    })
    return res.status(200).json({ message: "Done", report })

}
export const getAllDeletedReport = asyncHandler(async (req, res, next) => {

    const { page, size } = req.query
    const { skip, limit } = paginate(page, size)
    let report = await find({
        model: reportModel,
        filter: {
            isDeleted: { $ne: false }
        },
        skip,
        limit,
        populate: [
            {
                path: 'policeStationID',
                select: '-password'
            }
        ]
    })

    report.forEach((ele) => {
        ele.reporterNationID = CryptoJS.AES.decrypt(ele.reporterNationID,
            process.env.encKey).toString(CryptoJS.enc.Utf8)
    })
    return res.status(200).json({ message: "Done", report })
})

export const getReportById = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const report = await findByID({
        model: reportModel,
        filter: { _id: id },
        populate: [
            {
                path: 'policeStationID',
                select: '-password'
            }
        ]
    })
    if (!report) {
        return next(new Error("In-valid report ID", { cause: 400 }))
    }
    report.reporterNationID = CryptoJS.AES.decrypt(report.reporterNationID,
        process.env.encKey).toString(CryptoJS.enc.Utf8)
    return res.status(200).json({ message: "Done", report })


})



export const userGetHisReport = asyncHandler(async (req, res, next) => {

    const { id, nationalID } = req.body

    const report = await findOne({
        model: reportModel,
        filter: { _id: id, isDeleted: false },
        populate: [
            {
                path: 'policeStationID',
                select: '-password'
            }
        ]
    })

    if (!report) {
        return next(new Error("In-valid report ID", { cause: 400 }))
    } else {
        report.reporterNationID = CryptoJS.AES.decrypt(report.reporterNationID,
            process.env.encKey).toString(CryptoJS.enc.Utf8)
        if (nationalID.toString() === report.reporterNationID) {
            return res.status(200).json({ message: "Done", report })
        } else {
            return next(new Error("sorry you are not auth to see this report", { cause: 400 }))
        }
    }

})



export const softDeleteReport = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const report = await updateOne({
        model: reportModel,
        filter: { _id: id },
        data: {
            isDeleted: true,
            updateBy: req.user._id
        }
    })
    return report.modifiedCount ? res.status(200).json({ message: "Done", report })
        : next(new Error("In-valid report ID", { cause: 400 }))

})


export const restoreReport = asyncHandler(async (req, res, next) => {

    const { id } = req.params
    const report = await updateOne({
        model: reportModel,
        filter: { _id: id },
        data: {
            isDeleted: false,
            updateBy: req.user._id
        }
    })
    return report.modifiedCount ? res.status(200).json({ message: "Done", report })
        : next(new Error("In-valid report ID", { cause: 400 }))

})


export const changeReportStatus = asyncHandler(async (req, res, next) => {

    const { id, status } = req.body;
    if (!reportStatus[status]) {
        res.status(400).json({ message: "In-valid status" })
    } else {
        const report = await updateOne({
            model: reportModel,
            filter: { _id: id },
            data: {
                status: reportStatus[status],
                updateBy: req.user._id
            }
        })

        const link = `${process.env.FEURL}#/displayReport/${report._id}`
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
        <h3 style="padding-top:10px; color:#630E2B">  ${reportStatus[status]}</h3>
        </td>
        </tr>

        <tr>
        <td>
        <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Check your report</a>
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
        await sendEmail({ dest: report.reporterEmail, subject: "Report", message })

        return report ? res.status(200).json({ message: "Done", report })
            : next(new Error("In-valid report ID", { cause: 400 }))
    }

})

export const searchInReport = asyncHandler(async (req, res, next) => {

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
                model: reportModel,
                filter: {
                    class: { $in: classes }
                },
                populate: [{
                    path: "policeStationID"
                }]
            })
            allUsers = { users: matchedFace, matchedPercentage: matchedPercentage, flag: "FR" }
        } else {
            const { name, startAge, endAge, gender } = req.body
            const users = await find({
                model: reportModel,
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

        }
        return res.status(200).json({ message: "Done", data: allUsers })
    }
})


export const testModel = async (req, res, next) => {
    try {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Report'
        })
        const result = await axios.post(`${process.env.AIURL}/predict`, {
            headers: {
                'content-type': 'application/json'
            },
            data: {
                image: secure_url
            }
        })
        res.status(200).json({ message: "Done", response: result.data })
    } catch (error) {
        res.status(500).json({ message: "catch error", error })
    }
}



export const searchInReportV2 = async (req, res, next) => {
    const { name, startAge, endAge, gender } = req.body
    console.log({ name, startAge, endAge, gender });
    if (!req.file) {
        return next(new Error("Please upload your pic", { cause: 404 }))
    } else {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Reunion/search'
        })

        console.log({gender:gender.toLowerCase()});
        const result = await axios.post(`${process.env.AIURL}/getImageMatches`, {
            headers: {
                'content-type': 'application/json'
            },
            data: {
                image_url: secure_url,
                // publicId: public_id,
                gender:gender.toLowerCase(),
                type: "report"
            }
        })
        console.log({ result: result?.data?.topMatches });
        let allUsers;
        if (result?.data?.topMatches) {
            const { name, startAge, endAge, gender } = req.body
            console.log({startAge, endAge,});
            const ids = [];
            const matchedPercentage = []
            const matchedFaces = []
            for (const ele of result?.data?.topMatches) {

                const matchedFace = await findOne({
                    model: reportModel,
                    filter: {
                        _id: ele.report_id,
                        gender,
                        age: { $gte: startAge, $lte: endAge }
                    },
                    populate: [{
                        path: "policeStationID"
                    }]
                })
                if (matchedFace) {
                    matchedFace.reporterNationID = CryptoJS.AES.decrypt(matchedFace.reporterNationID,
                        process.env.encKey).toString(CryptoJS.enc.Utf8)
                    matchedFaces.push(matchedFace)
                    ids.push(ele.report_id)
                    matchedPercentage.push(`${ele.diffScore}`.substring(0, 7))
                }
            }
            console.log(matchedFaces);
            allUsers = { users: matchedFaces, matchedPercentage: matchedPercentage, flag: "FR" }
            return res.status(200).json({ message: "Done", data: allUsers })
        } else {
            const { name, startAge, endAge, gender } = req.body
            const users = await find({
                model: reportModel,
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

            users.forEach((ele) => {
                ele.reporterNationID = CryptoJS.AES.decrypt(ele.reporterNationID,
                    process.env.encKey).toString(CryptoJS.enc.Utf8)
            })
            allUsers = { users, flag: "NS" }
            return res.status(200).json({ message: "Done", data: allUsers })
        }

    }
}