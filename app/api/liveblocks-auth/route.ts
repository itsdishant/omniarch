import { auth, currentUser } from "@clerk/nextjs/server";
import { LiveblocksError } from "@liveblocks/node";

import {
  ensureLiveblocksRoom,
  getCursorColor,
  getLiveblocksClient,
} from "@/lib/liveblocks";
import { parseJsonBody, readRequiredRoom } from "@/lib/parse-json-body";
import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";

function forbiddenResponse(reason: string, status: 401 | 403 | 500) {
  return Response.json({ error: "forbidden", reason }, { status });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return forbiddenResponse("Unauthorized", 401);
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const room = readRequiredRoom(parsed.value);
  if (room instanceof Response) {
    return room;
  }

  const identity = await getCurrentClerkIdentity();
  if (!identity) {
    return forbiddenResponse("Unauthorized", 401);
  }

  const project = await findAccessibleProjectForViewer(room, identity);
  if (!project) {
    return forbiddenResponse("You don't have access to this room", 403);
  }

  try {
    await ensureLiveblocksRoom(room, { projectId: project.id });
  } catch (error) {
    if (error instanceof LiveblocksError) {
      console.error(
        `Error getting or creating room: ${error.status} - ${error.message}`,
      );
    } else {
      console.error("Unexpected error creating Liveblocks room:", error);
    }

    return Response.json(
      { error: "Unable to open collaboration room" },
      { status: 500 },
    );
  }

  const user = await currentUser();
  const displayName = [user?.firstName, user?.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();

  const name = displayName || user?.username || "Anonymous";
  const avatar = user?.imageUrl || "";
  const color = getCursorColor(userId);

  const liveblocks = getLiveblocksClient();
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      avatar,
      color,
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { body: sessionBody, status } = await session.authorize();
  return new Response(sessionBody, { status });
}
