"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { FEATURES, isClerkConfigured } from "@/lib/features";

/**
 * Controles de auth no header.
 * Sem chaves Clerk no env, não renderiza nada (dev/CI sem secrets).
 */
export function AuthControls() {
  if (!FEATURES.clerkAuth || !isClerkConfigured()) return null;

  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-stone-100 dark:text-slate-200 dark:hover:bg-stone-900"
          >
            Entrar
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
          >
            Criar conta
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </Show>
    </div>
  );
}
