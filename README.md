# Base44 Project

Use this repository to run and edit the app locally. Publish the Netlify site through a production build as described below.

Any change pushed to the repo will also be reflected in the Base44 Builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the Base44 CLI: `npm install -g base44@latest`.
5. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) â the local Base44 backend runs on it.

Run `base44 --help` (or see the [CLI reference](https://docs.base44.com/developers/references/cli/commands/introduction)) for the full command surface.

## Run Locally

Three commands, from the project root:

```bash
base44 login   # one-time per machine
base44 link    # one-time per clone
base44 dev     # local backend + frontend together
```

Open the frontend URL that `base44 dev` prints (typically `http://localhost:5173`).

Notes:

- **Every fresh clone needs `base44 link`.** It writes `base44/.app.jsonc` (the app-id pointer), which is deliberately gitignored. Your app id is in the Builder URL (`app.base44.com/apps/<id>/...`); `base44 link --help` shows the non-interactive flags.
- **`base44 dev` runs the frontend for you** (via `site.serveCommand` in this repo's `base44/config.jsonc`) â never run `npm run dev` yourself: alone it serves a UI with no backend behind it (`[base44] Proxy not enabled`, every `/api` call fails), and alongside `base44 dev` the second Vite silently takes the next port and you end up looking at the wrong one.
- **The app must be published at least once for the UI to load under `base44 dev`.** The frontend boots by fetching app settings from the hosted app; before the first publish that fails and every page redirects to login. The local API works regardless.
- Entities, functions, and auth run locally â entity data is **in-memory only**, wiped when `base44 dev` restarts. Everything else (Core integrations, OAuth login) is forwarded to your deployed app. Full breakdown: [Local development overview](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview).

## Frontend Only, Hosted Backend

To work on just the frontend against your app's live hosted backend:

```bash
base44 dev --remote
```

â ï¸ In this mode writes go to your app's **production data** â plain `base44 dev` keeps everything local.

## Publish Your Changes

This site uses Netlify Database for the personal library. Publishing an existing
deploy preview directly to production is not supported for sites with a database.
Production must run its own build so Netlify can apply database migrations to the
production database before publishing the new application.

Use one of these supported workflows:

- **Agent runs:** Use **Publish** on the agent run page. This is the supported
  publishing action for these changes; do not promote the deploy preview from
  its deploy details page.
- **Git-based changes:** Merge the feature branch into `main`, this site's
  production branch. The merge triggers a production build and deployment.

Keep the application changes and all database migration files together in the
published source. Netlify applies pending migrations automatically before the
production deploy becomes available. If a migration fails, resolve the failure
and trigger another production build.

Already-applied migration files must remain unchanged in the repository. Make
future schema changes with a new migration. Do not manually apply migrations or
copy a preview database connection into production. Preview libraries and
production libraries use separate database branches; preview library entries
are not transferred by publishing the application.

The Base44 Builder continues to sync from git separately. Publishing in Base44
does not replace the Netlify production build required for this site's functions
and database.

## Docs & Support

GitHub integration: [https://docs.base44.com/developers/app-code/local-development/github](https://docs.base44.com/developers/app-code/local-development/github)

Local development: [https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview)

Support: [https://app.base44.com/support](https://app.base44.com/support)


---

[![Restore to base44](https://img.shields.io/badge/Restore%20to-BASE44-orange?style=for-the-badge&logo=rocket)](https://app.base44.com/apps)

[![Netlify Status](https://api.netlify.com/api/v1/badges/bb2c2d52-98ce-4130-9e4f-06fc38f3f64c/deploy-status)](https://app.netlify.com/projects/mangadump/deploys)

## Manga sources

The catalogue requests MangaDex and MangaPill simultaneously by default. Both
providers run through Netlify Functions, so manga browsing does not depend on
hosted Base44 functions. Each provider keeps its own pagination cursor; a failed
provider is retried without skipping its results. Use the
source selector on Titles to browse either provider individually. MangaPill titles
have distinct identifiers so chapter lists and reader navigation stay with the
selected provider. The Top Rated shelf uses MangaDex because MangaPill does not
provide ratings.

MangaPill runs through `netlify/functions/mangapill.mjs`, adapted from the supplied
MIT-licensed scraper (license in `netlify/lib/MANGAPILL-LICENSE`). It fetches public
pages server-side without requiring a separate scraper deployment or credentials.
Use Netlify Dev on port 8889 when testing this integration locally. Upstream
outages appear as availability notices while successful sources remain visible.

Run the source integration checks with `node --test tests/*.test.mjs`.

## Personal library

Open a manga title and choose Currently Reading, Plan to Read, or Completed from
its library selector. My Library in the desktop or mobile navigation opens the
saved collection, with shelf counts, title search, shelf changes, and removal.
Both manga sources are supported, with separate entries for each source.

Library entries persist in Netlify Database using the Drizzle schema in
`db/schema.ts`. A private HttpOnly browser cookie identifies the collection;
entries are scoped to its hash on every database operation. This library does
not require login and does not sync across browsers or devices. Clearing the
browser's site cookies disconnects that browser from its saved collection.

Database migrations are generated into `netlify/database/migrations` and applied
automatically by Netlify during deployment. Production migrations require a
production build; follow **Publish Your Changes** above. Do not apply migrations
manually.
Run `node --test tests/*.test.mjs` for API validation and library-isolation tests.
