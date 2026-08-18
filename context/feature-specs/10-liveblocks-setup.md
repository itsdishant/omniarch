# Liveblocks Setup

Set up the realtime collaboration infrastructure using Liveblocks.

## Configuration

Configure the `liveblocks.config.ts` at the project root.

Define:

### Presence

- cursor position
- `isThinking` boolean

### UserMeta

- user ID
- display name
- avatar URL
- cursor color

## Liveblocks Client

Create a cached Liveblocks node client in `lib`.

Add a helper that deterministically maps a user ID to a consistent color from a
fixed palette.

## Auth Route

Create `POST /api/liveblocks-auth`.

Use the project ID as the Liveblocks room ID.

This route must:

1. require Clerk authentication
2. parse JSON with `parseJsonBody` and require `room`
3. verify project access using the existing access helper
4. ensure the Liveblocks room exists with `getOrCreateRoom` (`defaultAccesses:
   []`)
5. return an access-token session (`prepareSession`) with:
   - user name
   - avatar
   - generated cursor color
6. `session.allow(room, session.FULL_ACCESS)` after membership is confirmed

Denied access must return JSON `{ "error": "forbidden", "reason": "..." }` so
the Liveblocks client does not retry forever. Use `403` for missing project
membership.

Permissions stay in Prisma (owner / collaborator). Do not switch this route to
ID tokens unless room `usersAccesses` is synced on invite/remove.

## Dependencies

All required Liveblocks packages are already installed.

## Check When Done

- `liveblocks.config.ts` defines Presence and UserMeta
- Liveblocks client is cached
- auth route verifies project access and returns `{ error: "forbidden" }` on
  deny
- rooms are created with `getOrCreateRoom`
- user metadata is attached to sessions
- `npm run build` passes
