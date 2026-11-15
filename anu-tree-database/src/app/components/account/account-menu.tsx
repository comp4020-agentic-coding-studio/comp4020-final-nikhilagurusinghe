"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { beginSignUp } from "@/app/data/begin-sign-up";
import { authClient } from "@/lib/auth-client";
import DownArrowIcon from "../icons/down-arrow";
import KeyIcon from "../icons/key";
import UserIcon from "../icons/user";

export type AccountMenuProps = {
  // The session as the server saw it, so the first paint is already right
  // instead of flashing "sign in" while the client checks.
  initialUsername: string | null;
};

// Same pill as the tree popup's like and link buttons.
const PILL_BUTTON_CLASS =
  "group cursor-pointer disabled:cursor-default disabled:opacity-60 flex flex-row text-sm font-bold w-fit items-center gap-x-2 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap max-w-full";

export default function AccountMenu({ initialUsername }: AccountMenuProps) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const username: string | null = sessionPending
    ? initialUsername
    : ((session?.user as { username?: string } | undefined)?.username ?? null);

  const [newUsername, setNewUsername] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Passkey ceremonies report a cancelled prompt as an error; that's the user
  // changing their mind, not something to shout about.
  function reportError(
    error: { code?: string; message?: string } | null,
  ): boolean {
    if (!error) return false;
    if (error.code === "AUTH_CANCELLED") {
      setMessage(null);
    } else if (error.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
      setMessage(
        "this device already has a passkey for your account, try another device",
      );
    } else {
      setMessage(error.message ?? "something went wrong, try again");
    }
    return true;
  }

  function handleSignIn(): void {
    setMessage(null);
    startTransition(async () => {
      const { error } = await authClient.signIn.passkey();
      if (!reportError(error)) router.refresh();
    });
  }

  function handleSignUp(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const started = await beginSignUp(newUsername);
      if ("error" in started) {
        setMessage(started.error);
        return;
      }

      const result = await authClient.passkey.addPasskey({
        context: started.token,
        createSession: true,
      });
      if (reportError(result?.error ?? null)) return;

      setNewUsername("");
      router.refresh();
    });
  }

  function handleAddPasskey(): void {
    setMessage(null);
    startTransition(async () => {
      const result = await authClient.passkey.addPasskey();
      if (!reportError(result?.error ?? null)) setMessage("passkey added");
    });
  }

  function handleSignOut(): void {
    setMessage(null);
    startTransition(async () => {
      await authClient.signOut();
      router.refresh();
    });
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton className="cursor-pointer flex flex-row gap-x-2 h-12.5 backdrop-blur-sm px-2 py-2 rounded-full border border-white/20 items-center justify-between text-white focus:outline-none">
            <span className="ml-1 font-medium text-nowrap hidden sm:inline">
              account
            </span>
            <span className="flex flex-row items-center gap-x-2 h-8 rounded-full py-1 pl-3 pr-2 bg-white/20 backdrop-blur-sm text-nowrap">
              <UserIcon
                height={16}
                stroke="white"
                strokeWidth={2}
                fill="none"
              />
              <span className="max-w-32 truncate">{username ?? "sign in"}</span>
              <DownArrowIcon
                height={20}
                fill="white"
                stroke="white"
                strokeWidth={0}
                className={
                  open ? "rotate-180 transition-all" : "transition-all"
                }
              />
            </span>
          </PopoverButton>

          <PopoverPanel
            anchor={{ to: "bottom start", gap: 4, padding: 16 }}
            className="z-6767 w-72 max-w-[calc(100vw-32px)] flex flex-col gap-y-3 p-3 text-white font-sans border border-white/20 rounded-2xl backdrop-blur-xl"
          >
            {username ? (
              <>
                <span>
                  <h2 className="text-2xl/6.5 font-bold text-(--highlight-colour) truncate">
                    {username}
                  </h2>
                  <p className="text-sm">signed in with a passkey</p>
                </span>
                <p className="text-sm">
                  passkeys are the only way into your account, so add one on a
                  second device in case you lose this one.
                </p>
                <div className="flex flex-row gap-x-1 gap-y-1 flex-wrap">
                  <button
                    type="button"
                    className={PILL_BUTTON_CLASS}
                    disabled={pending}
                    onClick={handleAddPasskey}
                  >
                    <KeyIcon
                      height={15}
                      stroke="#d0d0d0"
                      strokeWidth={3}
                      fill="none"
                      className="group-hover:scale-120 transition-all"
                    />
                    add a passkey
                  </button>
                  <button
                    type="button"
                    className={PILL_BUTTON_CLASS}
                    disabled={pending}
                    onClick={handleSignOut}
                  >
                    sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={PILL_BUTTON_CLASS}
                  disabled={pending}
                  onClick={handleSignIn}
                >
                  <KeyIcon
                    height={15}
                    stroke="#d0d0d0"
                    strokeWidth={3}
                    fill="none"
                    className="group-hover:scale-120 transition-all"
                  />
                  sign in with a passkey
                </button>

                <form className="flex flex-col gap-y-2" onSubmit={handleSignUp}>
                  <label htmlFor="new-username" className="text-sm font-medium">
                    new here? pick a username
                  </label>
                  <input
                    id="new-username"
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    minLength={3}
                    maxLength={24}
                    value={newUsername}
                    onChange={(event) => setNewUsername(event.target.value)}
                    placeholder="username"
                    className="w-full h-8 rounded-full py-1 px-3 bg-white/20 backdrop-blur-sm placeholder:text-white/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className={PILL_BUTTON_CLASS}
                    disabled={pending}
                  >
                    <KeyIcon
                      height={15}
                      stroke="#d0d0d0"
                      strokeWidth={3}
                      fill="none"
                      className="group-hover:scale-120 transition-all"
                    />
                    create account
                  </button>
                </form>
              </>
            )}

            {message && (
              <output
                className={clsx(
                  "text-sm",
                  message === "passkey added" && "text-(--highlight-colour)",
                )}
              >
                {message}
              </output>
            )}
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
