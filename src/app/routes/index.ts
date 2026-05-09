import { Router } from "express"
import { authRouter } from "../modules/auth/auth.route"
import { userRouter } from "../modules/user/user.route"
import { companyRouter } from "../modules/company/company.route"
import { discussionRouter } from "../modules/discussion/discussion.route"
import { adminRouter } from "../modules/admin/admin.route"
import { mentorRouter } from "../modules/mentor/mentor.route"
import { sessionRouter } from "../modules/session/session.route"
import { reviewRouter } from "../modules/review/review.route"
import { notificationRouter } from "../modules/notification/notification.route"
import { SocialRoutes } from "../modules/social/social.route"


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
    {
        path: "/admin",
        route: adminRouter
    },
    {
        path: "/mentor",
        route: mentorRouter
    },
    {
        path: "/session",
        route: sessionRouter
    },
    {
        path: "/review",
        route: reviewRouter
    },
    {
        path: "/notification",
        route: notificationRouter
    },
    {
        path: "/social",
        route: SocialRoutes
    },

]

moduleRoute.forEach((route) => router.use(route.path, route.route))

export default router