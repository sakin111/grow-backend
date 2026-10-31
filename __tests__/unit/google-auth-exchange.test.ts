jest.mock("../../src/app/shared/googleAuthCode", () => ({
  createGoogleAuthCode: jest.fn(),
  consumeGoogleAuthCode: jest.fn(),
}));

jest.mock("../../src/app/shared/setCookie", () => ({
  setAuthCookie: jest.fn(),
}));

jest.mock("../../src/app/shared/userToken", () => ({
  createUserTokens: jest.fn(),
  createNewAccessTokenWithRefreshToken: jest.fn(),
}));

import { NextFunction, Request, Response } from "express";
import { authController } from "../../src/app/modules/auth/auth.controller";
import { consumeGoogleAuthCode } from "../../src/app/shared/googleAuthCode";
import { setAuthCookie } from "../../src/app/shared/setCookie";
import { createNewAccessTokenWithRefreshToken } from "../../src/app/shared/userToken";

describe("Google auth token exchange", () => {
  const tokens = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
  };

  const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }) as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets HttpOnly auth cookies and does not return tokens in JSON", async () => {
    jest.mocked(consumeGoogleAuthCode).mockResolvedValue(tokens);
    const req = { body: { code: "one-time-code" } } as unknown as Request;
    const res = createResponse();

    await authController.exchangeGoogleAuthCode(req, res, jest.fn() as NextFunction);

    expect(setAuthCookie).toHaveBeenCalledWith(res, tokens);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Google authentication code exchanged",
      data: null,
    });
  });

  it("refreshes the access cookie from the refresh-token cookie", async () => {
    jest.mocked(createNewAccessTokenWithRefreshToken).mockResolvedValue("new-access-token");
    const req = { cookies: { refreshToken: "refresh-token" } } as unknown as Request;
    const res = createResponse();

    await authController.getAccessToken(req, res, jest.fn() as NextFunction);

    expect(createNewAccessTokenWithRefreshToken).toHaveBeenCalledWith("refresh-token");
    expect(setAuthCookie).toHaveBeenCalledWith(res, { accessToken: "new-access-token" });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "New access token generated",
      data: { accessToken: "new-access-token" },
    });
  });
});
