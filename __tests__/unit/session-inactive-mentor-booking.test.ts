import { prisma } from "../../src/app/lib/prisma"
import { SessionServices } from "../../src/app/modules/session/session.service"

jest.mock("../../src/app/lib/prisma", () => ({
  prisma: {
    mentorProfile: {
      findUnique: jest.fn(),
    },
    sessionBooking: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock("../../src/app/modules/notification/notification.utils", () => ({
  sendInAppNotification: jest.fn(),
}))

describe("booking inactive mentors", () => {
  const findMentor = prisma.mentorProfile.findUnique as jest.Mock
  const findBooking = prisma.sessionBooking.findFirst as jest.Mock
  const createBooking = prisma.sessionBooking.create as jest.Mock

  beforeEach(() => {
    findMentor.mockResolvedValue({
      id: "mentor-profile-id",
      userId: "mentor-user-id",
      isActive: false,
    })
  })

  it("rejects booking requests for an inactive mentor", async () => {
    await expect(
      SessionServices.createBooking("owner-user-id", {
        mentorId: "mentor-profile-id",
        startTime: "2030-01-01T10:00:00.000Z",
        endTime: "2030-01-01T11:00:00.000Z",
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Mentor is not accepting booking requests",
    })

    expect(findBooking).not.toHaveBeenCalled()
    expect(createBooking).not.toHaveBeenCalled()
  })
})
