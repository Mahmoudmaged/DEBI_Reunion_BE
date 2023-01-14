import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from '../DB/connection.js'
import { globalErrorHandling } from './utils/errorHandling.js'
import authRouter from './modules/auth/auth.router.js'
import userRouter from './modules/user/user.router.js'
import reportRouter from './modules/report/report.router.js'
import shelterRouter from './modules/shelter/shelter.router.js'
import homelessRouter from './modules/homeless/homeless.router.js'
import adminRouter from './modules/admin/admin.router.js'




export const initApp = (app) => {
    const BASEURL = process.env.BASEURL;
    if (process.env.MOOD == "DEV") {
        app.use(morgan('dev'))
    } else {
        app.use(morgan('common'))
    }

    app.use(async (req, res, next) => {
        await res.header('Access-Control-Allow-Origin', '*');
        await res.header('Access-Control-Allow-Headers', '*')
        await res.header("Access-Control-Allow-Private-Network", 'true')
        await res.header('Access-Control-Allow-Methods','*')
        next();
    });
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(async (req, res, next) => {
        await res.header('Access-Control-Allow-Origin', '*');
        await res.header('Access-Control-Allow-Headers', '*')
        await res.header("Access-Control-Allow-Private-Network", 'true')
        await res.header('Access-Control-Allow-Methods','*')
        next();
    });
    app.get('/', (req, res) => {
        return res.send('<h1>Welcome to Family reunion for developer</h1>')
    })
    app.use(`${BASEURL}/auth`, authRouter)
    app.use(`${BASEURL}/user`, userRouter)
    app.use(`${BASEURL}/report`, reportRouter)
    app.use(`${BASEURL}/shelter`, shelterRouter)
    app.use(`${BASEURL}/homeless`, homelessRouter)
    app.use(`${BASEURL}/admin`, adminRouter)




    app.use("*", (req, res) => {
        return res.status(404).send("In-valid URL or Method")
    })
    app.use(globalErrorHandling)
    connectDB()

}