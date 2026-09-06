# cheatsheet — JavaScript & NumPy Reference

An open, no-login syntax cheat sheet covering **JavaScript** and **NumPy** — each entry with a one-line explanation and a runnable example hidden behind an expandable card.

**Stack:** React (in-browser via CDN + Babel, no build step) · Node.js + Express · HTML/CSS · Tailwind CSS (CDN)

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000** — that's it, no sign-up, no accounts.

## How it's put together

```
prep-web/
├── package.json
├── server/
│   ├── index.js        # Express app: serves the API + the static frontend
│   ├── sections.json   # Registry of available sections (JavaScript, NumPy, etc.)
│   ├── data.json       # JavaScript categories + entries
│   └── numpy.json      # NumPy categories + entries (12 categories, 100 entries)
└── public/
    ├── index.html      # loads React/Babel/Tailwind from CDN, mounts the app
    └── app.jsx         # the whole UI: section switcher, sidebar, search, expandable cards
```

- `GET /api/sections` returns the available cheatsheets.
- `GET /api/topics?section=javascript` (or `GET /api/topics`) returns the JavaScript cheat sheet.
- `GET /api/topics?section=numpy` returns the NumPy cheat sheet.
- Searching and expanding examples happen client-side with no page reloads.
