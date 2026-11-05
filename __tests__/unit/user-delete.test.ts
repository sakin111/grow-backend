jest.mock("../../src/app/lib/prisma", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

import { prisma } from "../../src/app/lib/prisma";
import { UserServices } from "../../src/app/modules/user/user.service";

describe("Delete own user account", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("soft-deletes and deactivates the authenticated user", async () => {
    await UserServices.deleteMe("user-id");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-id" },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  });
});
