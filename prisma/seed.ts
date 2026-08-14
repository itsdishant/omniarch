import { config } from "dotenv";

import { prisma } from "../lib/prisma";

config({ path: ".env.local" });

async function main() {
  console.log("No seed data for project models.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
