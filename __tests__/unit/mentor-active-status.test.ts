import express from "express"
import jwt from "jsonwebtoken"
import request from "supertest"
import cookieParser from "cookie-parser"
import { prisma } from "../../src/app/lib/prisma"
import { globalErrorHandler } from "../../src/app/error/GlobalErrorHandler"
import { MentorServices } from "../../src/app/modules/mentor/mentor.service"
import { mentorRouter } from "../../src/app/modules/mentor/mentor.route"

jest.mock("../../src/app/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    mentorProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/mentor", mentorRouter)
app.use(globalErrorHandler)

describe("mentor active status", () => {
  const findUser = prisma.user.findUnique as jest.Mock
  const findProfile = prisma.mentorProfile.findUnique as jest.Mock
  const updateProfile = prisma.mentorProfile.update as jest.Mock
  const findMany = prisma.mentorProfile.findMany as jest.Mock
  const countProfiles = prisma.mentorProfile.count as jest.Mock

  const tokenFor = (role: string) =>
    jwt.sign(
      { id: "mentor-user-id", email: "mentor@example.com", role },
      process.env.JWT_ACCESS_SECRET as string
    )

  beforeEach(() => {
    findUser.mockResolvedValue({
      id: "mentor-user-id",
      email: "mentor@example.com",
      status: "ACTIVE",
      isDeleted: false,
    })
    findProfile.mockResolvedValue({ id: "mentor-profile-id" })
    updateProfile.mockImplementation(
      ({ data }: { data: { isActive: boolean } }) =>
        Promise.resolve({ id: "mentor-profile-id", isActive: data.isActive })
    )
    findMany.mockResolvedValue([])
    countProfiles.mockResolvedValue(0)
  })

  it("only allows authenticated mentors to change active status", async () => {
    const response = await request(app)
      .patch("/mentor/profile/active-status")
      .set("Authorization", `Bearer ${tokenFor("OWNER")}`)
      .send({ isActive: true })

    expect(response.status).toBe(403)
    expect(findProfile).not.toHaveBeenCalled()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it("rejects a non-boolean active status", async () => {
    const response = await request(app)
      .patch("/mentor/profile/active-status")
      .set("Authorization", `Bearer ${tokenFor("MENTOR")}`)
      .send({ isActive: "true" })

    expect(response.status).toBe(422)
    expect(findProfile).not.toHaveBeenCalled()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it("does not accept a mentor ID in the request body", async () => {
    const response = await request(app)
      .patch("/mentor/profile/active-status")
      .set("Authorization", `Bearer ${tokenFor("MENTOR")}`)
      .send({ isActive: true, mentorId: "another-mentor-profile-id" })

    expect(response.status).toBe(422)
    expect(findProfile).not.toHaveBeenCalled()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it.each([true, false])("updates own profile isActive to %s", async (isActive) => {
    const response = await request(app)
      .patch("/mentor/profile/active-status")
      .set("Authorization", `Bearer ${tokenFor("MENTOR")}`)
      .send({ isActive })

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual({
      id: "mentor-profile-id",
      isActive,
    })
    expect(updateProfile).toHaveBeenCalledWith({
      where: { userId: "mentor-user-id" },
      data: { isActive },
      select: { id: true, isActive: true },
    })
  })

  it("returns not found when the authenticated mentor has no profile", async () => {
    findProfile.mockResolvedValue(null)

    const response = await request(app)
      .patch("/mentor/profile/active-status")
      .set("Authorization", `Bearer ${tokenFor("MENTOR")}`)
      .send({ isActive: true })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe("Mentor profile not found")
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it("filters inactive mentors from both directory queries", async () => {
    await MentorServices.getAllMentors({ isActive: "false" })
    await MentorServices.searchMentors({ isActive: "false" })

    expect(findMany).toHaveBeenCalledTimes(2)
    for (const [options] of findMany.mock.calls) {
      expect(options.where.AND).toContainEqual({ isActive: true })
    }

    expect(countProfiles).toHaveBeenCalledTimes(2)
    for (const [options] of countProfiles.mock.calls) {
      expect(options.where.AND).toContainEqual({ isActive: true })
    }
  })
})
