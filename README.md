# js.cheatsheet

An open, no-login JavaScript syntax reference. 19 topic groups, 180+ entries — each
with a one-line explanation and a runnable example hidden behind a dropdown.

**Stack:** React (in-browser via CDN + Babel, no build step) · Node.js + Express · HTML/CSS · Tailwind CSS (CDN)

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000** — that's it, no sign-up, no accounts.

## How it's put together

```
js-cheatsheet/
├── package.json
├── server/
│   ├── index.js     # Express app: serves the API + the static frontend
│   └── data.json     # every category + entry (title, explanation, code, output)
└── public/
    ├── index.html    # loads React/Babel/Tailwind from CDN, mounts the app
    └── app.jsx        # the whole UI: sidebar, search, expandable cards
```

- `GET /api/topics` returns the full cheatsheet as JSON.
- The frontend fetches that once on load and renders it — searching and expanding
  examples both happen client-side, no extra requests.
- There's deliberately no database, no auth, and no login page: this is meant to be
  a page anyone can land on and start reading immediately.

## Editing content

All the syntax entries live in `server/data.json`. Each item looks like:

```json
{
  "id": "map",
  "title": "map()",
  "explain": "Transforms every element and returns a brand-new array…",
  "code": "let nums = [1, 2, 3];\nnums.map(n => n * 2);",
  "output": "[2, 4, 6]",
  "core": true
}
```

`core: true` adds the "used constantly" badge (used for patterns React leans on
heavily, like `map`, closures, or `addEventListener`). `output` is optional — omit
it for entries that don't produce console output.
