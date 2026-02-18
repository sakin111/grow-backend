import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import router from './app/routes'
import passport, { Passport } from "passport"
import expressSession from "express-session"
import { envVar } from './app/config/envVar'

 export const app: Application = express()

app.use(expressSession({
   secret: envVar.EXPRESS_SESSION_SECRET,
   resave:false,
   saveUninitialized:false
}))
 app.use(passport.initialize())
 app.use(passport.session())
 app.use(express.json())
 app.use(cors())
 app.use(express.urlencoded({extended: true}))
 app.use("/api/v1", router)


 app.get("/", (req:Request, res:Response) => {
    res.status(200).json({message: "the GROW API is running successfully!"})
 })

