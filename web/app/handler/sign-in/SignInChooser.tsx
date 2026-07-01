"use client";

import { useState } from "react";
import Image from "next/image";
import { useStackApp } from "@stackframe/stack";
import type { SignInChooserMessages } from "./messages";
import {
  parseRememberedSignInAccounts,
  type RememberedSignInAccount,
  RECENT_SIGN_IN_ACCOUNTS_STORAGE_KEY,
} from "./recent-accounts";

type SignInChooserProps = {
  messages: SignInChooserMessages;
};

function readRememberedAccounts(): RememberedSignInAccount[] {
  if (typeof window === "undefined") return [];
  return parseRememberedSignInAccounts(
    window.localStorage.getItem(RECENT_SIGN_IN_ACCOUNTS_STORAGE_KEY)
  );
}

function initials(account: RememberedSignInAccount): string {
  const source = account.name ?? account.email ?? "cmux";
  const parts = source
    .split(/[\s@._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const value = parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`
    : source.slice(0, 1);
  return value.toUpperCase();
}

export function SignInChooser({ messages }: SignInChooserProps) {
  const app = useStackApp();
  const [accounts] = useState(readRememberedAccounts);
  const [pendingAccountID, setPendingAccountID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(account: RememberedSignInAccount | null) {
    setError(null);
    setPendingAccountID(account?.id ?? "new");
    try {
      await app.signInWithOAuth("google");
    } catch (error) {
      setPendingAccountID(null);
      setError(error instanceof Error ? error.message : messages.continueWithGoogle);
    }
  }

  return (
    <main className="min-h-screen bg-[#101010] px-5 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[560px] flex-col justify-center">
        <div className="overflow-hidden rounded-[28px] border border-white/12 bg-[#0b0b0b] shadow-2xl">
          <div className="flex items-center gap-4 border-b border-white/14 px-7 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[22px] font-semibold">
              <span className="text-[#4285f4]">G</span>
            </div>
            <div className="text-[20px] font-semibold tracking-normal text-zinc-200">
              {messages.continueWithGoogle}
            </div>
          </div>

          <div className="px-7 pb-8 pt-9 sm:px-10">
            <Image
              src="/brand/app-icon-dark.png"
              alt=""
              width={64}
              height={64}
              className="mb-10 h-16 w-16 rounded-2xl"
            />
            <h1 className="text-[44px] font-medium leading-tight tracking-normal text-zinc-100 sm:text-[56px]">
              {messages.title}
            </h1>
            <p className="mt-7 text-[22px] font-medium text-zinc-200">
              {messages.continuePrefix}{" "}
              <span className="text-blue-300">{messages.continueProduct}</span>
            </p>

            <div className="mt-12 divide-y divide-white/16 border-y border-white/16">
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <button
                    key={account.id}
                    className="grid w-full grid-cols-[52px_minmax(0,1fr)] items-center gap-4 py-5 text-left transition hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-70"
                    disabled={pendingAccountID !== null}
                    onClick={() => signIn(account)}
                    type="button"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-600 text-lg font-medium text-white">
                      {initials(account)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[20px] font-semibold text-zinc-100">
                        {account.name ?? account.email ?? account.id}
                      </span>
                      {account.email ? (
                        <span className="block truncate text-[18px] text-zinc-400">
                          {account.email}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-5 text-[18px] text-zinc-400">
                  {messages.noRecentAccounts}
                </div>
              )}

              <button
                className="grid w-full grid-cols-[52px_minmax(0,1fr)] items-center gap-4 py-5 text-left transition hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-70"
                disabled={pendingAccountID !== null}
                onClick={() => signIn(null)}
                type="button"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-500 text-[20px] text-zinc-200">
                  +
                </span>
                <span className="text-[20px] font-semibold text-zinc-100">
                  {pendingAccountID === "new" ? messages.loading : messages.useAnotherAccount}
                </span>
              </button>
            </div>

            {error ? (
              <p className="mt-5 rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <p className="mt-10 text-[17px] leading-7 text-zinc-300">
              {messages.privacyPrefix}{" "}
              <a className="font-semibold text-blue-300" href="/privacy">
                {messages.privacyPolicy}
              </a>{" "}
              {messages.privacyMiddle}{" "}
              <a className="font-semibold text-blue-300" href="/terms">
                {messages.termsOfService}
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
