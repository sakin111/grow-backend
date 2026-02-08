import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import router from './app/routes'

 export const app: Application = express()

 app.use(express.json())

 app.use(cors())

 app.use(express.urlencoded({extended: true}))

 app.use("/api/v1", router)


 app.get("/", (req:Request, res:Response) => {
    res.status(200).json({message: "the GROW API is running successfully!"})
 })

