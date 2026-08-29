import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

let parsedBaseURL: URL | undefined;
try {
  parsedBaseURL = new URL(baseURL);
} catch {
  // Fallback for invalid or malformed URLs
}

const isLocalServer =
  !process.env.PLAYWRIGHT_BASE_URL ||
  Boolean(
    parsedBaseURL &&
    (parsedBaseURL.hostname === "localhost" ||
      parsedBaseURL.hostname === "127.0.0.1"),
  );

const localPort = parsedBaseURL?.port || "3000";
const webServerUrl = parsedBaseURL
  ? `${parsedBaseURL.protocol}//${parsedBaseURL.host}`
  : "http://localhost:3000";
const webServerCommand =
  localPort !== "3000" ? `npm run dev -- -p ${localPort}` : "npm run dev";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./tests/global.setup.ts",
  globalTeardown: "./tests/global.teardown.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: [],
    },
  ],
  webServer: isLocalServer
    ? {
        command: webServerCommand,
        url: webServerUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});
