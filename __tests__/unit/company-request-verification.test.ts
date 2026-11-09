import { prisma } from "../../src/app/lib/prisma"
import { CompanyServices } from "../../src/app/modules/company/company.service"
import jest from "jest-mock"

jest.mock("../../src/app/lib/prisma", () => ({
  prisma: {
    company: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    companyVerificationRequest: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

describe("requestCompanyVerification", () => {
  const findCompany = prisma.company.findUnique as jest.Mock
  const updateCompany = prisma.company.update as jest.Mock
  const findPendingRequest =
    prisma.companyVerificationRequest.findFirst as jest.Mock
  const createRequest = prisma.companyVerificationRequest.create as jest.Mock
  const transaction = prisma.$transaction as jest.Mock

  beforeEach(() => {
    findCompany.mockResolvedValue({
      id: "company-1",
      ownerId: "owner-1",
      verificationStatus: "UNVERIFIED",
    })
    findPendingRequest.mockResolvedValue(null)
    createRequest.mockResolvedValue({
      id: "request-1",
      companyId: "company-1",
      requestedById: "owner-1",
      status: "PENDING",
    })
    updateCompany.mockResolvedValue({ id: "company-1" })
    transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations)
    )
  })

  it("creates a pending request for the company and updates its status", async () => {
    const payload = {
      website: "https://example.com",
      contactEmail: "owner@example.com",
      note: "Please verify our company",
    }

    const result = await CompanyServices.requestVerification(
      "company-1",
      "owner-1",
      payload
    )

    expect(findCompany).toHaveBeenCalledWith({
      where: { id: "company-1" },
      select: {
        id: true,
        ownerId: true,
        verificationStatus: true,
      },
    })
    expect(findPendingRequest).toHaveBeenCalledWith({
      where: { companyId: "company-1", status: "PENDING" },
      select: { id: true },
    })
    expect(createRequest).toHaveBeenCalledWith({
      data: {
        companyId: "company-1",
        requestedById: "owner-1",
        ...payload,
      },
    })
    expect(updateCompany).toHaveBeenCalledWith({
      where: { id: "company-1" },
      data: { verificationStatus: "PENDING" },
    })
    expect(result).toEqual({
      id: "request-1",
      companyId: "company-1",
      requestedById: "owner-1",
      status: "PENDING",
    })
  })

  it("returns not found when the company does not exist", async () => {
    findCompany.mockResolvedValue(null)

    await expect(
      CompanyServices.requestVerification("missing-company", "owner-1", {
        website: "https://example.com",
        contactEmail: "owner@example.com",
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Company not found",
    })
    expect(createRequest).not.toHaveBeenCalled()
  })

  it("prevents a different user from requesting verification", async () => {
    await expect(
      CompanyServices.requestVerification("company-1", "another-owner", {
        website: "https://example.com",
        contactEmail: "owner@example.com",
      })
    ).rejects.toMatchObject({ statusCode: 403 })
    expect(createRequest).not.toHaveBeenCalled()
  })
})
