# harshnanavati.com

Personal portfolio of Harsh Nanavati, Applied AI Engineer. A static site built with [Astro](https://astro.build), deployed to GitHub Pages.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run verify    # unit tests, build, built-HTML tests, checks, browser tests
```

## Common edits

- **Add a video:** set `youtubeId` (the 11-character YouTube ID) in the project's `src/content/work/<slug>.mdx` frontmatter. The intro video's ID (About page + home link) lives in `src/lib/intro.ts`.
- **Add the headshot:** save it as `src/assets/headshot.jpg`.
- **Edit a case study:** edit `src/content/work/<slug>.mdx`. Diagrams live in `src/diagrams/<slug>.ts`.

Every push to `main` runs `npm run verify` and deploys only if it passes.

## Confidentiality check

`scripts/check-banned.mjs` fails the build if a banned term appears in the built site or in any file tracked by git. The list itself is never committed: locally it's read from `../banned_terms.local.txt`, and in CI from the `BANNED_TERMS` repository secret (one term per line). Without a list, the check refuses to pass.


