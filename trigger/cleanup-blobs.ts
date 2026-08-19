import { logger, task } from "@trigger.dev/sdk";
import { del } from "@vercel/blob";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cleanupBlobsPayloadSchema = z.object({
  blobUrls: z.array(z.string().url()).min(1),
});

type CleanupBlobsPayload = z.infer<typeof cleanupBlobsPayloadSchema>;

export const cleanupBlobsTask = task({
  id: "cleanup-blobs",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 10000,
    maxTimeoutInMs: 3600000,
  },
  run: async (payload: CleanupBlobsPayload) => {
    const { blobUrls } = payload;
    const results: Array<{ url: string; success: boolean; error?: string }> = [];

    for (const url of blobUrls) {
      try {
        await del(url);
        results.push({ url, success: true });
        logger.log("Blob deleted successfully", { url });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        results.push({ url, success: false, error: message });
        logger.error("Failed to delete blob", { url, error: message });
      }
    }

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      // Throw to trigger retry for failed deletions
      throw new Error(
        `Failed to delete ${failed.length} blob(s): ${failed.map((f) => f.url).join(", ")}`,
      );
    }

    return { deleted: results.length, results };
  },
});