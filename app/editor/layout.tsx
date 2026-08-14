import { auth } from "@clerk/nextjs/server";

import { SignedOutRedirect } from "@/components/auth/signed-out-redirect";

export default async function EditorLayout({
  children,
}: LayoutProps<"/editor">) {
  await auth.protect();

  return <SignedOutRedirect>{children}</SignedOutRedirect>;
}
