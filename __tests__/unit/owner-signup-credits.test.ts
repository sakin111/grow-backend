import { CreditLotSource } from "@prisma/client";
import { prisma } from "../../src/app/lib/prisma";
import { UserServices } from "../../src/app/modules/user/user.service";

jest.mock("../../src/app/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../../src/app/utils/verificationEmail", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("owner signup credits", () => {
  const findUser = prisma.user.findUnique as jest.Mock;
  const createUser = prisma.user.create as jest.Mock;

  beforeEach(() => {
    findUser.mockResolvedValue(null);
    createUser.mockResolvedValue({
      id: "owner-id",
      email: "owner@example.com",
      name: "Test Owner",
      role: "OWNER",
      createdAt: new Date(),
    });
  });

  it("grants 100 initial credits and creates a signup-bonus lot", async () => {
    await UserServices.createUser({
      email: "owner@example.com",
      name: "Test Owner",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        creditBalance: 100,
        creditLots: {
          create: [{
            source: CreditLotSource.SIGNUP_BONUS,
            totalCredits: 100,
            remainingCredits: 100,
          }],
        },
      }),
    }));
  });
});
