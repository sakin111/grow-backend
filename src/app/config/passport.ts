import passport from "passport"
import { Strategy as localStrategy } from "passport-local"
import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"
import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import { Role } from "@prisma/client"

passport.use(new localStrategy({
    usernameField: "email",
    passwordField: "password"
}, async (email: string, password: string, done: any) => {
    try {
        const userExist = await prisma.user.findUnique({
            where: { email },
            include:{
                auths:true
            }
        })

        const googleAuth = userExist?.auths.some(auth => auth.provider === "GOOGLE")
        if(googleAuth){
            return done(null, false, { message: "Please login with Google" })
        }
        if (!userExist) {
            return done(null, false, { message: "User does not exist" })
        }
        const isPasswordValid = await bcrypt.compare(password, userExist.password)
        if (!isPasswordValid) {
            return done(null, false, { message: "Invalid password" })
        }
        done(null, userExist)
    } catch (error) {
        console.log(error)
        done(error, false)
    }
}))


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        const email = profile.email?.[0].value;
        if (!email) {
            return done(null, false, { message: "Email is required" })
        }

        let userExist = await prisma.user.findUnique({
            where: { email: profile.email?.[0].value }
        })
        

        if (!userExist) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            userExist = await prisma.user.create({
                data: {
                    email: profile.email?.[0].value,
                    name: profile.displayName,
                    picture: profile.photos?.[0].value as string,
                    role: Role.OWNER,
                    password: hashedPassword,
                    auths: {
                        create: {
                            provider: "GOOGLE",
                            providerId: profile.id
                        }
                    }
                }
            })
        }

        done(null, userExist)
    } catch (error) {
        console.log(error)
        done(error, false)
    }
}))


passport.serializeUser((user: any, done: (err:any, id?: unknown) => void) => {
    done(null, user.id)
})

passport.deserializeUser(async (id: any, done: (err: any, user?:unknown) => void) =>{
    try {
        const user = await prisma.user.findUnique({
            where: {id}
        })
        done(null, user)
    } catch (error) {
        done(error, false)
    }
})