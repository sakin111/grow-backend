import { Router } from "express"
import { authRouter } from "../modules/auth/auth.route"
import { userRouter } from "../modules/user/user.route"
import { companyRouter } from "../modules/company/company.route"
import { discussionRouter } from "../modules/discussion/discussion.route"


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
    {
        path: "/discussion",
        route: discussionRouter
    },

]

moduleRoute.forEach((route) => router.use(route.path, route.route))

export default router