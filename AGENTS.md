<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI conventions

- Every clickable element must show `cursor: pointer`. All native `<button>` elements get this automatically via the global `button { cursor: pointer; }` rule in `src/app/globals.css` — do not remove it. Any `<div>`/`<span>`/etc. acting as a button via `onClick` (not a native `<button>` or `<a>`) needs `cursor-pointer` added explicitly in its className.
