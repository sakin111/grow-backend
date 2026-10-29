import { randomBytes } from "crypto";
import { redisClient } from "../lib/redis";
import { moveMessagePortToContext } from "worker_threads";

const GOOGLE_AUTH_CODE_TTL_SECONDS = 60;
const GOOGLE_AUTH_CODE_PREFIX = "google_auth_code:";

interface GoogleAuthTokens {
    accessToken: string;
    refreshToken: string;  
}

export const createGoogleAuthCode = async (tokens: GoogleAuthTokens) => {
    const code = randomBytes(32).toString("base64url");
    const stored = await redisClient.set(
        `${GOOGLE_AUTH_CODE_PREFIX}${code}`,
        JSON.stringify(tokens),
        { EX: GOOGLE_AUTH_CODE_TTL_SECONDS, NX: true }
    );

    if (stored !== "OK") {
        throw new Error("Could not store Google authentication code");
    }

    return code;
};

export const consumeGoogleAuthCode = async (code: string) => {
    const storedTokens = await redisClient.getDel(`${GOOGLE_AUTH_CODE_PREFIX}${code}`);

    if (!storedTokens) {
        return null;
    }

    const tokens: unknown = JSON.parse(storedTokens);
    if (
        typeof tokens !== "object" ||
        tokens === null ||
        !("accessToken" in tokens) ||
        typeof tokens.accessToken !== "string" ||
        !("refreshToken" in tokens) ||
        typeof tokens.refreshToken !== "string"
    ) {
        throw new Error("Stored Google authentication code is invalid");
    }

    return tokens as GoogleAuthTokens;
};
