jest.mock("../../src/app/lib/redis", () => ({
  redisClient: {
    set: jest.fn(),
    getDel: jest.fn(),
  },
}));

import { redisClient } from "../../src/app/lib/redis";
import { consumeGoogleAuthCode, createGoogleAuthCode } from "../../src/app/shared/googleAuthCode";

describe("Google auth code exchange", () => {
  const tokens = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores tokens behind a short-lived, single-use code", async () => {
    jest.spyOn(redisClient, "set").mockResolvedValue("OK");

    const code = await createGoogleAuthCode(tokens);

    expect(code).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(redisClient.set).toHaveBeenCalledWith(
      `google_auth_code:${code}`,
      JSON.stringify(tokens),
      { EX: 60, NX: true }
    );
  });

  it("consumes a code and returns its tokens", async () => {
    jest.spyOn(redisClient, "getDel").mockResolvedValue(JSON.stringify(tokens));

    await expect(consumeGoogleAuthCode("single-use-code")).resolves.toEqual(tokens);
    expect(redisClient.getDel).toHaveBeenCalledWith("google_auth_code:single-use-code");
  });

  it("rejects expired or already-consumed codes", async () => {
    jest.spyOn(redisClient, "getDel").mockResolvedValue(null);

    await expect(consumeGoogleAuthCode("expired-code")).resolves.toBeNull();
  });
});
