import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import { prisma } from './app/lib/prisma'
import { logger } from './app/lib/logger'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
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
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './app/config/swagger'

export const app: Application = express()

// Security Headers
app.use(helmet())

// Rate Limiting
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // limit each IP to 100 requests per windowMs
   message: "Too many requests from this IP, please try again after 15 minutes",
   standardHeaders: true,
   legacyHeaders: false,
})

app.use("/api", limiter)

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

// CORS Hardening
app.use(cors({
   origin: [envVar.FRONTEND_URL],
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
   allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.urlencoded({ extended: true }))

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// router
app.use("/api/v1", router)

// connected or not
app.get("/", (req: Request, res: Response) => {
   res.status(200).json({ message: "the GROW API is running successfully!" })
})

// Health-check endpoint for Docker / load balancers
app.get("/health", async (_req: Request, res: Response) => {
   try {
      await prisma.$queryRaw`SELECT 1`
      res.json({ status: "ok", uptime: process.uptime() })
   } catch {
      logger.error("Health check failed: database unreachable")
      res.status(503).json({ status: "error", message: "Database unreachable" })
   }
})

app.use(globalErrorHandler)
app.use(notFound)