import { sendEmail } from "../../src/app/utils/sendEmail"

describe("sendEmail", () => {
    let fetchMock: jest.SpyInstance

    beforeEach(() => {
        fetchMock = jest.spyOn(global, "fetch").mockReset()
    })

    it("renders the template and posts it to the mail API", async () => {
        fetchMock.mockResolvedValueOnce({ ok: true, status: 200 } as Response)

        await sendEmail({
            to: "recipient@example.com",
            subject: "Verify your email",
            templateName: "VerifyEmail",
            templateData: { name: "Test User", verifyLink: "https://example.com/verify" },
        })

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, options] = fetchMock.mock.calls[0]
        expect(url).toBe("https://grow-roan.vercel.app/api/send-email")
        expect(options).toMatchObject({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-mail-secret": "test-mail-api-secret",
            },
        })
        expect(options.signal).toBeInstanceOf(AbortSignal)

        const body = JSON.parse(options.body as string) as { to: string; subject: string; html: string }
        expect(body).toMatchObject({
            to: "recipient@example.com",
            subject: "Verify your email",
        })
        expect(body.html).toContain("Test User")
        expect(body.html).toContain("https://example.com/verify")
        expect(Object.keys(body).sort()).toEqual(["html", "subject", "to"])
    })

    it("throws a 502 AppError when the mail API returns a non-success status", async () => {
        fetchMock.mockResolvedValueOnce({ ok: false, status: 503 } as Response)

        await expect(sendEmail({
            to: "recipient@example.com",
            subject: "Verify your email",
            templateName: "VerifyEmail",
            templateData: { name: "Test User", verifyLink: "https://example.com/verify" },
        })).rejects.toMatchObject({ statusCode: 502, message: "Email error" })
    })

    it("throws a 502 AppError when the mail API request fails", async () => {
        fetchMock.mockRejectedValueOnce(new Error("request timed out"))

        await expect(sendEmail({
            to: "recipient@example.com",
            subject: "Verify your email",
            templateName: "VerifyEmail",
            templateData: { name: "Test User", verifyLink: "https://example.com/verify" },
        })).rejects.toMatchObject({ statusCode: 502, message: "Email error" })
    })
})
