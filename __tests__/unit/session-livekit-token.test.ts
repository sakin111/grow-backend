import { BookingStatus, SessionStatus } from "@prisma/client";
import { TokenVerifier } from "livekit-server-sdk";
import { envVar } from "../../src/app/config/envVar";
import { prisma } from "../../src/app/lib/prisma";
import { SessionServices } from "../../src/app/modules/session/session.service";

jest.mock("../../src/app/lib/prisma", () => ({
  prisma: {
    sessionBooking: {
      findUnique: jest.fn(),
    },
    videoSession: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("LiveKit session tokens", () => {
  const bookingId = "booking-id";
  const ownerId = "owner-user-id";
  const mentorId = "mentor-user-id";
  const findBooking = prisma.sessionBooking.findUnique as jest.Mock;
  const createVideoSession = prisma.videoSession.create as jest.Mock;
  const tokenVerifier = new TokenVerifier(envVar.LIVEKIT_API_KEY, envVar.LIVEKIT_API_SECRET);
  const booking = {
    id: bookingId,
    ownerId,
    owner: { name: "Session Owner" },
    mentorId: "mentor-profile-id",
    mentor: {
      userId: mentorId,
      user: { name: "Session Mentor" },
    },
    status: BookingStatus.CONFIRMED,
  };

  beforeEach(() => {
    findBooking.mockResolvedValue({
      ...booking,
      videoSession: { status: SessionStatus.ONGOING },
    });
    createVideoSession.mockResolvedValue({});
  });

  const expectPublishGrants = async (token: string, identity: string) => {
    const claims = await tokenVerifier.verify(token);

    expect(claims.sub).toBe(identity);
    expect(claims.video).toMatchObject({
      room: bookingId,
      roomJoin: true,
      canPublish: true,
      canPublishSources: ["microphone", "camera"],
      canSubscribe: true,
    });
  };

  it("allows the mentor starting a session to publish microphone and camera tracks", async () => {
    findBooking.mockResolvedValueOnce({ ...booking, videoSession: null });

    const result = await SessionServices.startSession(mentorId, bookingId);

    await expectPublishGrants(result.token, mentorId);
  });

  it.each([
    ["owner", ownerId],
    ["mentor", mentorId],
  ])("allows the %s joining a session to publish microphone and camera tracks", async (_role, userId) => {
    const result = await SessionServices.joinSession(userId, bookingId);

    await expectPublishGrants(result.token, userId);
  });
});
