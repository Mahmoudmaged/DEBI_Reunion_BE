import mongoose from 'mongoose';
import CryptoJS from "crypto-js";
export const reportStatus = {
   Hold: "Hold",
   Archive: "Archive",
   Active: "Active",
   Matched: "Matched",
   Blocked: "Blocked"
}
const reportSchema = new mongoose.Schema({
   //missing info
   name: { type: String },
   age: { type: Number },
   gender: { type: String, default: "Male", enum: ['Male', "Female"] },
   imageURl: { type: String },
   publicId: { type: String },
   description: { type: String },
   lostLocation: { type: String },
   lostTime: { type: String },
   //reporter info 
   reporterName: { type: String },
   reporterNationID: { type: String },
   reporterPhone: { type: String },
   reporterEmail: { type: String },
   // reporterID: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
   status: { type: String, default: reportStatus.Hold },
   // policeStation info
   policeStationID: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
   updateBy: { type: mongoose.Types.ObjectId, ref: 'User' },
   isDeleted: { type: Boolean, default: false },
   volunteer: [{
      description: { type: String },
      date: { type: String },
      location: { type: String },
      gender: { type: String, default: "Male", enum: ['Male', "Female"] },
      imageURl: { type: String },
      publicId: { type: String },
   }],
   class: Number,

}, {
   timestamps: true
})

// reportSchema.post('find', async function (results) {
//    // console.log(result[0].reporterNationID);
//    for (let  result of results) {
//       console.log(result.reporterNationID);
//       // console.log(i);
//       var bytes = CryptoJS.AES.decrypt(result.reporterNationID, process.env.encKey);
//       var originalText = bytes.toString(CryptoJS.enc.Utf8);
//       result.reporterNationID=originalText
//       // result[i].reporterNationID = CryptoJS.AES.decrypt(result[i].reporterNationID, process.env.encKey).toString(CryptoJS.enc.Utf8);
//       // console.log(result[i].reporterNationID );
//    }
//    console.log("out");

// })

export const reportModel = mongoose.models.Report || mongoose.model("Report", reportSchema);