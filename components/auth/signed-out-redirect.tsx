"use client";

import { RedirectToSignIn, Show } from "@clerk/nextjs";
import type { ReactNode } from "react";

export function SignedOutRedirect({ children }: { children: ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  );
}
