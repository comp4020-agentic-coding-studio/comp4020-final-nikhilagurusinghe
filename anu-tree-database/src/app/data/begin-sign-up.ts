"use server";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { user } from "@/db/schema";
import { createSignUpToken } from "@/lib/signup-token";

const db = drizzle(process.env.DB_FILE_NAME!);

const USERNAME_PATTERN = /^[a-z0-9_-]{3,24}$/;

export type BeginSignUpResult =
  | { token: string; username: string }
  | { error: string };

// First half of a passkey sign-up: checks the username and hands back a signed
// token for the passkey ceremony. Nothing is stored until the passkey is
// verified (see afterVerification in src/lib/auth.ts).
export async function beginSignUp(
  rawUsername: string,
): Promise<BeginSignUpResult> {
  // Server actions are a public endpoint, so don't trust the argument.
  if (typeof rawUsername !== "string") return { error: "Choose a username." };

  const username = rawUsername.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) {
    return {
      error: "usernames are 3–24 characters: letters, numbers, - and _",
    };
  }

  const [taken] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);
  if (taken) return { error: `${username} is taken` };

  return { token: createSignUpToken(username), username };
}
