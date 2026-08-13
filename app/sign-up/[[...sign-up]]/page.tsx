import { SignUp } from "@clerk/nextjs";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export default function SignUpPage() {
  return (
    <AuthSplitLayout>
      <SignUp />
    </AuthSplitLayout>
  );
}
