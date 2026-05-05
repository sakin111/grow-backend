import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import router from './app/routes'
import passport from "passport"
import "./app/config/passport"
import expressSession from "express-session"
import { envVar } from './app/config/envVar'
import { globalErrorHandler } from './app/error/GlobalErrorHandler'
import notFound from './app/error/notFound'
import cookieParser from 'cookie-parser'
import { RedisStore } from "connect-redis"
import { redisClient } from './app/lib/redis'

export const app: Application = express()


// session
const redisStore = new RedisStore({
   client: redisClient,
   prefix: "grow:",
})

app.use(expressSession({
   store: redisStore,
   secret: envVar.EXPRESS_SESSION_SECRET,
   resave: false,
   saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

// router
app.use("/api/v1", router)

// connected or not
app.get("/", (req: Request, res: Response) => {
   res.status(200).json({ message: "the GROW API is running successfully!" })
})



app.use(globalErrorHandler)
app.use(notFound)