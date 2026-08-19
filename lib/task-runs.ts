import { prisma } from "@/lib/prisma";

export async function createTaskRun(data: {
  runId: string;
  projectId: string;
  userId: string;
}) {
  return prisma.taskRun.create({ data });
}

export async function findOwnedTaskRun(runId: string, userId: string) {
  return prisma.taskRun.findFirst({
    where: { runId, userId },
  });
}
