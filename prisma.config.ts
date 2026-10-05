import { defineConfig, env } from "prisma/config";
import { loadEnv } from "./lib/env-file";

loadEnv();

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
