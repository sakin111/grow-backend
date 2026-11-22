import { CreditLotSource, Prisma } from "@prisma/client";
import {
  chargeBookingCredits,
  grantSignupCredits,
  refundBookingCredits,
} from "../../src/app/modules/billing/billing.service";

describe("credit wallet", () => {
  const ownerId = "owner-id";
  const bookingId = "booking-id";

  it("creates an auditable signup bonus lot", async () => {
    const tx = {
      creditLot: { create: jest.fn().mockResolvedValue({}) },
    } as unknown as Prisma.TransactionClient;

    await grantSignupCredits(tx, ownerId, 100);

    expect(tx.creditLot.create).toHaveBeenCalledWith({
      data: {
        userId: ownerId,
        source: CreditLotSource.SIGNUP_BONUS,
        totalCredits: 100,
        remainingCredits: 100,
      },
    });
  });

  it("spends signup credits before paid credits and tracks their revenue share basis", async () => {
    const tx = {
      $queryRaw: jest.fn(),
      user: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      creditLot: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "paid-lot",
            source: CreditLotSource.PURCHASE,
            remainingCredits: 50,
            remainingNetRevenueCents: 900,
            createdAt: new Date("2026-01-02T00:00:00.000Z"),
          },
          {
            id: "signup-lot",
            source: CreditLotSource.SIGNUP_BONUS,
            remainingCredits: 20,
            remainingNetRevenueCents: 0,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]),
        update: jest.fn().mockResolvedValue({}),
      },
      bookingCreditAllocation: { create: jest.fn().mockResolvedValue({}) },
    } as unknown as Prisma.TransactionClient;

    await chargeBookingCredits(tx, ownerId, bookingId, 60);

    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: ownerId, creditBalance: { gte: 60 } },
      data: { creditBalance: { decrement: 60 } },
    });
    expect(tx.bookingCreditAllocation.create).toHaveBeenNthCalledWith(1, {
      data: {
        bookingId,
        creditLotId: "signup-lot",
        credits: 20,
        netRevenueCents: 0,
      },
    });
    expect(tx.bookingCreditAllocation.create).toHaveBeenNthCalledWith(2, {
      data: {
        bookingId,
        creditLotId: "paid-lot",
        credits: 40,
        netRevenueCents: 720,
      },
    });
  });

  it("restores wallet credits and their revenue basis when a booking is cancelled", async () => {
    const tx = {
      $queryRaw: jest.fn(),
      user: { update: jest.fn().mockResolvedValue({}) },
      creditLot: { update: jest.fn().mockResolvedValue({}) },
      bookingCreditAllocation: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "allocation-id",
            creditLotId: "paid-lot",
            credits: 40,
            netRevenueCents: 720,
          },
        ]),
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as Prisma.TransactionClient;

    await refundBookingCredits(tx, ownerId, bookingId);

    expect(tx.creditLot.update).toHaveBeenCalledWith({
      where: { id: "paid-lot" },
      data: {
        remainingCredits: { increment: 40 },
        remainingNetRevenueCents: { increment: 720 },
      },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: ownerId },
      data: { creditBalance: { increment: 40 } },
    });
    expect(tx.bookingCreditAllocation.update).toHaveBeenCalledWith({
      where: { id: "allocation-id" },
      data: { refundedAt: expect.any(Date) },
    });
  });

  it("rejects a booking when the owner cannot afford its credit cost", async () => {
    const tx = {
      $queryRaw: jest.fn(),
      user: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      creditLot: { findMany: jest.fn() },
    } as unknown as Prisma.TransactionClient;

    await expect(chargeBookingCredits(tx, ownerId, bookingId, 101)).rejects.toMatchObject({
      statusCode: 402,
      message: "Insufficient credits to book this mentor",
    });
    expect(tx.creditLot.findMany).not.toHaveBeenCalled();
  });
});
