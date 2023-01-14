import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
   userName: { type: String },
   email: { type: String },
   phone: { type: String },
   location: { type: String },
   role: { type: String, default: 'User' },
   confirmEmail: { type: Boolean, default: false },
   approved: { type: Boolean, default: false },
   forgetCode: { type: String },
   password: { type: String },
   nationalID: { type: String },
   imageURl: { type: String },
   online: { type: String, default: false },
   lastSeen: { type: String },
   blocked: { type: Boolean, default: false },
   code: String

}, {
   timestamps: true
})

export const userModel = mongoose.models.User || mongoose.model("User", userSchema);