jest.mock("../../src/app/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "../../src/app/lib/prisma";
import { AdminServices } from "../../src/app/modules/admin/admin.service";
import AppError from "../../src/app/errorHelper/AppError";

describe("Admin delete user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("soft-deletes and deactivates the selected user", async () => {
    jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-id" } as never);
    jest.mocked(prisma.user.update).mockResolvedValue({
      id: "user-id",
      name: "User",
      email: "user@example.com",
      isDeleted: true,
      isActive: false,
    } as never);

    await expect(AdminServices.deleteUser("user-id")).resolves.toEqual({
      id: "user-id",
      name: "User",
      email: "user@example.com",
      isDeleted: true,
      isActive: false,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-id" },
      data: { isDeleted: true, isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isDeleted: true,
        isActive: true,
      },
    });
  });

  it("returns not found when the user does not exist", async () => {
    jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(AdminServices.deleteUser("missing-user")).rejects.toBeInstanceOf(AppError);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
