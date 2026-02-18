import passport from "passport"
import { Strategy as localStrategy } from "passport-local"
import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"

passport.use(new localStrategy({
  usernameField: "email",
  passwordField: "password"
}, async (email: string, password: string, done: any) => {
  try {
    const userExist = await prisma.user.findUnique({
      where: { email }
    })

    if (!userExist) {
      return done(null, false, { message: "User not found" })
    }

    const isPasswordValid = await bcrypt.compare(password, userExist.password)

    if (!isPasswordValid) {
      return done(null, false, { message: "Invalid password" })
    }

    return done(null, userExist)
  } catch (error) {
    console.log(error)
    done(error, false)
  }
}))

export default passport