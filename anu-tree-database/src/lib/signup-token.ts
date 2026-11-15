import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// A passkey-first sign-up happens in two requests: the browser asks for
// registration options, then sends back the signed credential. This token
// carries the chosen username and the new user's id between them. It's signed
// so the browser can't swap in someone else's id, and short-lived so a token
// that leaks is useless soon after.

const TOKEN_LIFETIME_MS = 5 * 60 * 1000;

export type SignUpClaims = {
  userId: string;
  username: string;
  expiresAt: number;
};

function sign(payload: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSignUpToken(username: string): string {
  const claims: SignUpClaims = {
    userId: randomUUID(),
    username,
    expiresAt: Date.now() + TOKEN_LIFETIME_MS,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

// Returns the claims if the token is genuine and unexpired, otherwise null.
export function readSignUpToken(
  token: string | null | undefined,
): SignUpClaims | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as SignUpClaims;
    if (
      typeof claims.userId !== "string" ||
      typeof claims.username !== "string"
    )
      return null;
    if (typeof claims.expiresAt !== "number" || claims.expiresAt < Date.now())
      return null;
    return claims;
  } catch {
    return null;
  }
}
