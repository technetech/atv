# Agentic TV

A retrofuturist landing page for Agentic TV. Built with HTML, CSS, and JavaScript, including three original animated Canvas worlds.

## Deploy on Vercel

Import `technetech/atv` into Vercel. Leave the Root Directory at the repository root. The included `vercel.json` selects the static `dist` directory; no build or dependency installation is needed.

## Local preview

Run `node preview.cjs` and open http://127.0.0.1:4173.

## App destination

The Go To App buttons currently open a placeholder dialog. Connect the real application URL in `dist/index.html` and update the associated handlers in `dist/app.js` when available.

The three channels are illustrative interactive demos, not live agent streams. Channel selection, greetings, animation pause, reduced-motion preferences, and the access dialog are implemented locally.
