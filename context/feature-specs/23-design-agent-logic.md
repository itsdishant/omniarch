# Design Agent Logic

Implement the full AI design agent so a user prompt results in real-time updates
on the collaborative canvas, with visible AI presence and status.

## Implementation

1. Update the design agent task in `trigger/design-agent.ts`.

   Before implementing:
   - check `context/project-overview.md` and `context/architecture-context.md`
     for product behavior and system rules
   - check Liveblocks and Trigger.dev agent skills for current patterns on
     canvas mutation and background task execution
   - follow the existing Trigger.dev setup and agent patterns already in the
     project
   - reuse existing Liveblocks flow and presence patterns instead of creating
     new ones

   Then implement:
   - use the LLM (now OpenRouter via `aiModel()`) to interpret the user prompt
     via `generateText` tools (not `Output.object()`):
     `addNode`, `moveNode`, `resizeNode`, `updateNodeData`,
     `deleteNode`, `addEdge`, `deleteEdge`
   - update the canvas using the existing collaborative flow utilities
   - support actions like:
     - add node
     - move node
     - resize node
     - update node data
     - delete node
     - add edge
     - delete edge

   - publish AI activity to the shared status feed so all users see progress
   - update AI presence (cursor + thinking state) while the task runs
   - push clear status messages at key steps (start, processing, complete)

   - ensure generated designs follow:
     - allowed node shapes
     - color palette
     - layout and spacing rules
   - reject add-node and add-edge operations whose IDs already exist, and
     report failed additions or mutations with missing targets to the model
     without overwriting canvas data

   - handle errors gracefully and update status if something fails
   - clear AI presence when the task finishes

## Dependencies

All packages are already installed. **Updated:** the LLM provider was later swapped to OpenRouter — `OPENROUTER_API_KEY` is in `.env.local` and the model is built via `aiModel()` in `lib/ai-model.ts` (`@openrouter/ai-sdk-provider`). `@ai-sdk/google` has been removed.

## Scope Limits

- don’t change canvas architecture
- don’t introduce a new state system outside Liveblocks
- don’t bypass existing collaborative flow utilities

## Check When Done

- Design task updates the canvas through the existing collaborative flow.
- AI presence and status are visible to all participants.
- Status messages reflect task progress.
- Errors are handled without breaking the canvas.
- `npm run build` passes.
