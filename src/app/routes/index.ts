import { Router } from "express"
import { authRouter } from "../modules/auth/auth.route"
import { userRouter } from "../modules/user/user.route"
import { companyRouter } from "../modules/company/company.route"


const router = Router()

const moduleRoute= [
    {
        path: "/auth",
        route: authRouter
    },
    {
        path: "/user",
        route: userRouter
    },
    {
        path: "/company",
        route: companyRouter
    },

]

moduleRoute.forEach((route) => router.use(route.path, route.route))

export default router