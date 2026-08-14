import { currentUser } from "@clerk/nextjs/server";

export async function getViewerEmails(): Promise<string[]> {
  const user = await currentUser();

  if (!user) {
    return [];
  }

  return user.emailAddresses.map((address) => address.emailAddress);
}
