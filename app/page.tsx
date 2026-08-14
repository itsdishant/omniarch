import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  await auth.protect();
  redirect("/editor");
}
