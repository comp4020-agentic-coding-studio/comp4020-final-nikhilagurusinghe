import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { passkey } from "@better-auth/passkey";
import { APIError, betterAuth } from "better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { drizzle } from "drizzle-orm/libsql";
import {
  account,
  passkey as passkeyTable,
  relations,
  session,
  user,
  verification,
} from "@/db/schema";
import { readSignUpToken } from "./signup-token";

const db = drizzle(process.env.DB_FILE_NAME!, { relations });

// Passkeys are the only way in: no passwords, no email, no social logins.
// BETTER_AUTH_SECRET and BETTER_AUTH_URL come from the environment. The URL
// also decides which domain passkeys are bound to (localhost in dev, the
// fly.dev domain in production).
export const auth = betterAuth({
  appName: "ANU Tree Database",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { user, session, account, verification, passkey: passkeyTable },
    // Sign-up creates the user, the passkey and the session together; if any
    // step fails none of them should be left behind.
    transaction: true,
  }),
  hooks: {
    // When a signed-in user adds another passkey, the plugin labels it with
    // their email, which here is the placeholder (see createUser below). That
    // label is what shows in the browser prompt and the password manager, so
    // swap in the username before the options reach the browser.
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/passkey/generate-register-options") return;

      const session = await getSessionFromCtx(ctx);
      const username = (session?.user as { username?: string } | undefined)
        ?.username;
      const options = ctx.context.returned as
        | { user?: { name: string; displayName: string } }
        | undefined;
      if (!username || !options?.user) return;

      return ctx.json({
        ...options,
        user: { ...options.user, name: username, displayName: username },
      });
    }),
  },
  user: {
    additionalFields: {
      // input: false, so it can only be set by the sign-up flow below, never
      // by a client calling update-user.
      username: { type: "string", required: true, unique: true, input: false },
    },
  },
  plugins: [
    passkey({
      rpName: "ANU Tree Database",
      registration: {
        // Lets someone with no account register a passkey (passkey-first
        // sign-up). Signed-in users adding a backup passkey still go through
        // their session.
        requireSession: false,

        // Names the passkey's owner before the browser creates it. Nothing is
        // written to the database yet.
        resolveUser: async ({ context }) => {
          const claims = readSignUpToken(context);
          if (!claims) {
            throw new APIError("BAD_REQUEST", {
              message: "Sign-up expired, please try again.",
            });
          }
          return {
            id: claims.userId,
            name: claims.username,
            displayName: claims.username,
          };
        },

        // Runs once the passkey has been verified, in the same transaction that
        // stores it and creates the session. Creating the user here means an
        // abandoned or failed sign-up leaves nothing in the database.
        afterVerification: async ({ ctx, user: passkeyUser, context }) => {
          const claims = readSignUpToken(context);
          // No token, or one for a different user: this is a signed-in user
          // adding another passkey, so there is no one to create.
          if (!claims || claims.userId !== passkeyUser.id) return;

          const created = await ctx.context.internalAdapter.createUser(
            {
              id: claims.userId,
              name: claims.username,
              username: claims.username,
              // Better Auth requires a unique email on every user. These users
              // have none, so this placeholder fills the column. The .invalid
              // TLD is reserved and can never receive mail.
              email: `${claims.userId}@users.invalid`,
              emailVerified: false,
            },
            { method: "passkey" },
          );
          if (!created) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Could not create your account.",
            });
          }

          return { userId: claims.userId };
        },
      },
    }),
    // Must be last: lets auth.api calls made from server actions set cookies.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
