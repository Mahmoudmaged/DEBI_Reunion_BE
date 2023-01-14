import mongoose from 'mongoose'

const connectDB = async () => {
    mongoose.set('strictQuery', true)
    return await mongoose.connect(`${process.env.DBURLOnline}`)
        .then((result) => {
            console.log(`connected DB on ${process.env.DBURLOnline}`);
        }).catch((err) => {
            console.log(`Fail to connect DB ${err}`);
        })
}

export default connectDB