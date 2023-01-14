import mongoose from 'mongoose';

export const homeLessStatus = {
   undefined: "undefined",
   Hold: "Hold",
   Archive: "Archive",
   Active: "Active",
   Matched: "Matched",
   Blocked: "Blocked"
}

const homelessSchema = new mongoose.Schema({
   // homeless info
   name: { type: String },
   age: { type: Number },
   gender: { type: String },
   imageURl: { type: String },
   publicId:{type:String},
   description: { type: String },
   foundLocation: { type: String },
   foundTime: { type: String },
   //shelter info
   shelterID: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required:true },
   policeStationID: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required:true },
   reportID: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },//fro matching with report when happened
   //founder info
   finderName: { type: String },
   finderNationID: { type: String },
   finderPhone: { type: String },
   finderEmail: { type: String },
   //status
   status: { type: String, default: homeLessStatus.undefined },
   updateBy: { type: mongoose.Types.ObjectId, ref: 'User' },
   isDeleted: { type: Boolean, default: false }

}, {
   timestamps: true
})


export const homelessModel = mongoose.models.Homeless  || mongoose.model("Homeless", homelessSchema);