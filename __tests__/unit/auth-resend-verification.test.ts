import { prisma } from "../../src/app/lib/prisma"
import { AuthServices } from "../../src/app/modules/auth/auth.service"
import { sendEmail } from "../../src/app/utils/sendEmail"

jest.mock("../../src/app/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        verificationToken: {
            deleteMany: jest.fn(),
            create: jest.fn(),
        },
    },
}))

jest.mock("../../src/app/utils/sendEmail", () => ({
    sendEmail: jest.fn(),
}))

describe("resendVerificationEmail", () => {
    const findUnique = prisma.user.findUnique as jest.Mock
    const deleteMany = prisma.verificationToken.deleteMany as jest.Mock
    const createToken = prisma.verificationToken.create as jest.Mock
    const sendEmailMock = sendEmail as jest.Mock

    beforeEach(() => {
        findUnique.mockResolvedValue({
            email: "user@example.com",
            name: "Test User",
            emailVerified: false,
            isDeleted: false,
        })
        deleteMany.mockResolvedValue({ count: 0 })
        createToken.mockResolvedValue({})
        sendEmailMock.mockResolvedValue(undefined)
    })

    it("replaces the prior token and sends a fresh verification email", async () => {
        const result = await AuthServices.resendVerificationEmail("user@example.com")

        expect(deleteMany).toHaveBeenCalledWith({
            where: { email: "user@example.com" },
        })
        expect(createToken).toHaveBeenCalledWith({
            data: expect.objectContaining({
                email: "user@example.com",
                token: expect.stringMatching(/^\d{6}$/),
                expires: expect.any(Date),
            }),
        })
        expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
            to: "user@example.com",
            subject: "Verify your email",
            templateName: "VerifyEmail",
        }))
        expect(result.message).toMatch(/If an unverified account exists/)
    })

    it("returns the same response without sending mail for an unknown account", async () => {
        findUnique.mockResolvedValue(null)

        const result = await AuthServices.resendVerificationEmail("unknown@example.com")

        expect(deleteMany).not.toHaveBeenCalled()
        expect(sendEmailMock).not.toHaveBeenCalled()
        expect(result.message).toMatch(/If an unverified account exists/)
    })

    it("does not send another email for a verified account", async () => {
        findUnique.mockResolvedValue({
            email: "user@example.com",
            name: "Test User",
            emailVerified: true,
            isDeleted: false,
        })

        const result = await AuthServices.resendVerificationEmail("user@example.com")

        expect(deleteMany).not.toHaveBeenCalled()
        expect(sendEmailMock).not.toHaveBeenCalled()
        expect(result.message).toMatch(/If an unverified account exists/)
    })
})
