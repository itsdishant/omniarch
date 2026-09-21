# Node Editing

Add resizing and inline label editing to canvas nodes.

## Implementation

1. Add resizing.
   - selected nodes should show resize handles
   - prevent nodes from being resized below a minimum size
   - keep resize handles subtle and consistent with the dark canvas UI

2. Add inline label editing.
   - keep the node label centered inside the node
   - double-click the center/label area of a node to edit its label
   - show placeholder text in the same centered position when the label is empty
   - keep editing smooth without causing layout shifts
   - show a textarea over the label while editing
   - update the label as users type
   - `Enter` commits; `Shift+Enter` inserts a line break
   - close editing on blur or `Escape`
   - prevent text editing interactions from dragging or panning the canvas

3. Keep all node updates connected to the existing collaborative canvas state.

4. Show intended line breaks in labels instead of the characters `\n`.
   - decode escaped `\n` / `\r` sequences on AI writes, graph reads, display, and Architect chat
   - wrap node labels so real newlines are visible
   - rewrite existing collaborative node and edge labels that still contain escaped newlines when the canvas loads
   - keep edge badges single-line after decoding (collapse newlines to spaces)

## Scope Limits

- don't change shape rendering from the previous unit
- don't change the shape panel or drag preview
- don't change how dropped nodes are created
- keep this focused on resize and label editing only

## Check When Done

- Selected nodes show resize handles.
- Resizing updates node dimensions through the existing node state flow.
- Double-clicking a node opens inline label editing.
- Label editing updates node labels through the existing sync flow.
- Editing closes on blur or Escape.
- Escaped `\n` in existing and new labels renders as a real line break.
- Text interactions do not trigger canvas drag or pan.
- `npm run build` passes without type errors.
