import { SignIn } from "@clerk/nextjs";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export default function SignInPage() {
  return (
    <AuthSplitLayout>
      <SignIn />
    </AuthSplitLayout>
  );
}
