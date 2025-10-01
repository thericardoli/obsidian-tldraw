# Copilot instructions for obsidian-tldraw

Purpose: Enable AI coding agents to be productive immediately in this Obsidian community plugin that embeds a minimal tldraw v4 canvas with a custom "Branching Chat" workflow.

## Architecture at a glance
- Runtime: Obsidian plugin (TypeScript → bundled to `main.js` via esbuild). Entry `main.ts` re-exports `src/main.ts`.
- Plugin core: `src/main.ts` registers a custom view `BranchingChatView` (`BRANCHING_CHAT_VIEW_TYPE`) and a settings tab. Commands: ribbon icon + `open-branching-chat` open the view.
- View layer: `src/view/BranchingChatView.tsx` hosts a React root and mounts `BranchingChatRoot` with `settings`, a per-leaf `persistenceKey`, and a `notify` helper wired to `Notice`.
- React app: `src/branchingChat/BranchingChatRoot.tsx` provides context (`BranchingChatConfigProvider`) exposing `streamEndpoint` and `notify` to children. `App.tsx` mounts `<Tldraw />` with:
  - Custom `shapeUtils`: `NodeShapeUtil`, `ConnectionShapeUtil`
  - Custom `bindingUtils`: `ConnectionBindingUtil`
  - UI overrides/components: `WorkflowToolbar`, `components` (custom Toolbar, conditional StylePanel), `options` (no multi-page, action shortcuts in menu).
  - `onMount`: seed first node, set snap, add `PointingPort` child state to `select`, enforce z-order with `keepConnectionsAtBottom`, and `disableTransparency` for `node`/`connection`.

## Data model and flow
- Shapes
  - `node` (in `NodeShapeUtil`): HTML-backed shape that renders body + `Port`s. Ports defined per node type via `nodeTypes.tsx` and each definition in `nodes/types/*`.
  - `connection` (in `ConnectionShapeUtil`): bezier path between two terminals (`start`/`end`). Terminals usually derived from `ConnectionBinding`s; otherwise use own `props` during dragging.
- Bindings (`ConnectionBindingUtil`)
  - Enforce exactly one binding per terminal; auto-delete extras; delete connection on node delete/isolate; propagate `onPortConnect/Disconnect` to node definitions.
  - Helpers: `getConnectionBindings`, `getConnectionBindingPositionInPageSpace`, `createOrUpdateConnectionBinding`, `removeConnectionBinding`.
- Ports/UI
  - Port geometry/constants in `branchingChat/constants.tsx` and CSS in `branchingChat/index.css`. `getPortAtPoint` and `portState` manage eligible/hinting highlighting while dragging.
- Z-order
  - `keepConnectionsAtBottom` registers side effects to keep `connection` shapes below others within a parent.
- Streaming integration
  - Settings (`src/settings.ts`): `streamEndpoint` string.
  - `MessageNode` (`nodes/types/MessageNode.tsx`) builds a contextual message history from upstream nodes, POSTs to `${streamEndpoint}/stream`, and streams/decodes chunks into `assistantMessage`.

## How to build, run, and debug
- Install: `npm install`
- Dev (watch): `npm run dev` (esbuild context watch, sourcemap inline in dev)
- Prod build: `npm run build` (typecheck + bundle/minify). Output: `main.js` at repo root.
- Test manually in Obsidian: copy `main.js`, `manifest.json`, `styles.css` to `<Vault>/.obsidian/plugins/obsidian-tldraw/` and enable in Obsidian. Use ribbon or command `Open Branching Chat canvas`.

## Conventions and patterns
- Keep `main.ts` minimal (plugin lifecycle, registering views/commands/settings). Feature logic lives under `src/**` (see `AGENTS.md`).
- React UI lives entirely inside the custom view container. Use `createRoot` and re-render on settings changes via `BranchingChatView.updateSettings`.
- tldraw customization
  - Register custom shapes via `shapeUtils` and bindings via `bindingUtils` on `<Tldraw />`.
  - Extend the `select` tool with child states (e.g., `PointingPort`) for port-aware interactions.
  - Keep connections visually underneath nodes with `keepConnectionsAtBottom`.
  - Disable shape opacity changes for workflow shapes with `disableTransparency(editor, ['node','connection'])`.
- Node types
  - Add a new node: create `src/branchingChat/nodes/types/<YourNode>.tsx` exporting `NodeDefinition`; register in `NodeDefinitions` in `nodeTypes.tsx`; define ports via `shapeInputPort/shapeOutputPort` and sizing via `getBodyWidthPx/HeightPx`.
  - The toolbar auto-populates tools from `getNodeDefinitions(editor)` into `WorkflowToolbar` overrides; ensure `title`, `icon`, and `getDefault()` are set.
- Streaming worker expectations
  - `streamEndpoint` should point to the Cloudflare Worker in `templates/branching-chat/worker`. The UI posts an array of `{ role, content }` and expects a streamed response body (optionally SSE `data:` lines). Errors notify via Obsidian `Notice`.

## Key files to read first
- `src/main.ts`, `src/view/BranchingChatView.tsx` — plugin/view lifecycle and React mounting
- `src/branchingChat/App.tsx` — Tldraw integration points and onMount wiring
- `src/branchingChat/nodes/NodeShapeUtil.tsx`, `src/branchingChat/connection/ConnectionShapeUtil.tsx` — custom shapes
- `src/branchingChat/connection/ConnectionBindingUtil.tsx`, `src/branchingChat/ports/*` — port mechanics, bindings, and hints
- `src/branchingChat/nodes/types/MessageNode.tsx` — streaming example and node behaviors

## Gotchas
- External/bundled: esbuild marks `obsidian`, `electron`, codemirror, and Node built-ins as externals. Do not import Node/Electron APIs in code intended for mobile.
- `tsconfig.json` uses `jsx: react-jsx` and `module: Node16`; include only sources under `src/**` (templates are excluded).
- CSS depends on `tldraw/tldraw.css` and `Inter` font; UI look relies on `index.css` class names.
- Keep command IDs and view type stable after release; bump `manifest.json` and `versions.json` together when releasing.
