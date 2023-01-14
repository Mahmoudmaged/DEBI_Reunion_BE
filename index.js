import dotenv from 'dotenv'
import express from 'express'
import { initApp } from './src/server.routing.js'
dotenv.config({ path: "./config/.env" })
const app = express()
const port = 3000|| process.env.PORT


initApp(app)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))