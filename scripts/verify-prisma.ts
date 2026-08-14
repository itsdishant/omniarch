import { config } from "dotenv";

import { prisma } from "../lib/prisma";

config({ path: ".env.local" });

async function main() {
  const projects = await prisma.project.findMany({ take: 1 });

  if (!Array.isArray(projects)) {
    throw new Error("Expected a project list from Prisma");
  }

  console.log("✅ Connected.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
