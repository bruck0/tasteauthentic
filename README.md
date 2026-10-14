# TasteAuthentic

A mobile-first local web prototype for discovering cultural dining experiences. Built with React, Vite, Lucide icons, and Leaflet.

## Run locally

Requires Node.js 18+ (Node.js 22 recommended).

```bash
git clone https://github.com/bruck0/tasteauthentic.git
cd tasteauthentic
npm ci
npm run dev
```

Open the local address printed by Vite, usually http://localhost:5173.

These commands work in a terminal on Windows, macOS, or Linux. If using WSL, run them inside your Linux distribution.

The server binds to all interfaces to support previews from WSL or another device on your network. Use `npm run dev -- --host 127.0.0.1` for a loopback-only server.

## Included

- 12 fictional restaurants in San Francisco, New York, and Chicago.
- Search by restaurant, dish, region, cuisine, or neighborhood.
- Natural-language search runs entirely in the browser, with no API, model, or model download. Type a phrase and press Enter. Try “cheap vegetarian Mexican in SF”, “best ramen in NYC”, “Indian in the Sunset”, or “vegetarian in SF, not Mexican”.
- Search interpretations appear as removable filter chips; manual filters remain editable. Searches support one city, neighborhood, and positive cuisine at a time, plus cuisine exclusions.
- “Near me” uses the selected city, without device location access. Unsupported exact budgets, opening hours, distance, and dietary claims show guidance instead of guessed matches. Unrecognized words remain keyword constraints.
- City, cuisine, price, and vegetarian filters; rating, review-count, and price sorting.
- Restaurant details, thoughtful sample reviews, and cultural context.
- Interactive map with restaurant markers and detail links.
- Three curated collections.
- Saved places persisted in local storage.
- Review form with rating, dish, personal perspective, and up to three photos.
- Client-side photo resizing, validation, and local persistence.
- Responsive layouts, keyboard controls, accessible native dialogs, and reduced-motion support.

All restaurants, addresses, ratings, and existing reviews are sample content. Food photography is illustrative. New reviews and bookmarks stay in this browser and are not shared with other users. Clearing browser storage removes them. The sample aggregate rating stays fixed; new reviews appear with their individual ratings and increase the displayed review count.

The app requires no backend, account, API key, or environment variables. Photography and fonts are bundled locally. OpenStreetMap map tiles require an internet connection; the restaurant list remains usable if tiles are unavailable.

## Verify and build

```bash
npm test
npm run build
npm run preview
```

`dist/` contains the production build.

## Project structure

- `src/App.jsx`: screens, dialogs, filters, map, review form, local storage.
- `src/data.js`: sample content and pure discovery filtering.
- `src/search.js`: deterministic phrase parsing, aliases, and text normalization. This is a constrained language prototype, not an LLM or semantic embedding search.
- `src/styles.css`: visual system and responsive layouts.
- `public/images/`: bundled illustrative food photographs.
- `public/fonts/`: bundled Google Fonts typefaces.
- `tests/discovery.test.js`: combined filtering, search, saved collections, and sorting tests.
- `tests/natural-search.test.js`: phrase interpretation, exclusions, unsupported requests, and search-to-results tests.

## Working together

Create a branch for your changes and open a pull request against `main`. Run `npm test` and `npm run build` before requesting review. Teammates without write access can fork the repository and open a pull request from their fork.

This repository shares the source code. Each local instance uses its own browser storage; reviews and photos do not sync between teammates.

## Credits

Photography: [Unsplash](https://unsplash.com). Bibimbap: [Maria Klichik on Unsplash](https://unsplash.com/photos/a-table-topped-with-bowls-of-food-and-chopsticks--UUkXJIXgy4). Dan dan noodles: [sharonang on Pixabay](https://pixabay.com/photos/noodles-dan-dan-food-traditional-606543/). Fonts: DM Sans and Manrope from [Google Fonts](https://fonts.google.com). Map tiles and attribution: [OpenStreetMap](https://www.openstreetmap.org/copyright). Icons: [Lucide](https://lucide.dev).
