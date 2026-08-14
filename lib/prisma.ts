import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

config({ path: ".env.local" });

interface PrismaGlobal {
  prisma?: PrismaClient;
}

const globalForPrisma = globalThis as typeof globalThis & PrismaGlobal;

function readDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (typeof databaseUrl !== "string" || databaseUrl.trim() === "") {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    !databaseUrl.startsWith("prisma+postgres://") &&
    !databaseUrl.startsWith("postgres://") &&
    !databaseUrl.startsWith("postgresql://")
  ) {
    throw new Error(
      "DATABASE_URL must be a postgres://, postgresql://, or prisma+postgres:// URL",
    );
  }

  return databaseUrl;
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = readDatabaseUrl();

  if (databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    });
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
