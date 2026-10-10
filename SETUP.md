# Setting up draamirabbas.com

About 45 minutes, once. After this you only use the admin panel.

## What you need
- A GitHub account (free) with two-factor authentication on
- A Vercel account (free; sign up with GitHub)
- Node.js 20 or newer on your computer (nodejs.org) — only for steps 1 and 4

## 1. Try it on your computer
```
npm install
npm run dev
```
Open http://localhost:4321 for the site and http://localhost:4321/keystatic for the admin panel.
Edits you save here change the files in `content/` directly.

## 2. Put the code on GitHub
Create an empty **private** repository on github.com called `draamirabbas-site`, then:
```
git remote add origin https://github.com/<your-username>/draamirabbas-site.git
git push -u origin main
```

## 3. Deploy on Vercel
1. vercel.com → Add New → Project → import `draamirabbas-site`. Framework is detected as Astro.
2. Click Deploy. You get a `…vercel.app` address; the public pages work immediately.

## 4. Connect the admin panel to GitHub (one time)
The online admin panel saves by committing to your repo, so it needs a GitHub App.
1. On your computer create a file `.env` with:
   ```
   PUBLIC_KEYSTATIC_STORAGE=github
   PUBLIC_KEYSTATIC_REPO=<your-username>/draamirabbas-site
   ```
2. Run `npm run dev`, open http://localhost:4321/keystatic and follow **Create GitHub App**.
   Keystatic creates the app and adds four values to `.env`:
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
3. In Vercel → Project → Settings → Environment Variables, add all six values from `.env`.
4. On github.com → Settings → Developer settings → GitHub Apps → your new app:
   add the callback URL `https://<your-domain>/api/keystatic/github/oauth/callback`
   (add the `…vercel.app` one too until the domain is connected).
5. Redeploy in Vercel. Now `https://<your-domain>/keystatic` asks you to sign in with GitHub.
   Only people with write access to the repo can edit.

## 5. Connect your domain
1. Buy draamirabbas.com (Cloudflare Registrar or Namecheap).
2. Vercel → Project → Settings → Domains → add it and follow the DNS instructions.
3. Add `SITE_URL=https://draamirabbas.com` to Vercel environment variables and redeploy.

## 6. Turn on the daily refresh
1. Vercel → Project → Settings → Git → Deploy Hooks → create one named `daily`, branch `main`. Copy the URL.
2. GitHub repo → Settings → Secrets and variables → Actions → New secret `VERCEL_DEPLOY_HOOK` = that URL.
3. GitHub repo → Actions → Daily rebuild → Run workflow, to test it.

## 7. Fill in the feeds (admin panel → Site settings → Automatic feeds)
| Field | Where to find it |
| --- | --- |
| Substack feed URL | Your Substack address + `/feed` |
| YouTube channel IDs | YouTube Studio → Settings → Channel → Advanced settings (starts with `UC`) |
| ORCID iD | orcid.org profile, format `0000-0000-0000-0000` |
| GitHub username | your github.com profile |

Each feed is optional; a section with no feed shows the items you pin under *Featured posts and videos*.

## Optional
- **Contact form:** create a free form at formspree.io, paste its URL in Site settings → Contact form endpoint.
- **Analytics:** Cloudflare Web Analytics, or Vercel → Analytics (free tier).
- **Search Console:** verify the domain at search.google.com/search-console and submit `/sitemap-index.xml`.

## Where things live
| Path | What it is |
| --- | --- |
| `content/` | Everything you edit in the admin panel (JSON files) |
| `keystatic.config.ts` | The admin panel: sections and fields |
| `src/pages/` | One file per page |
| `src/styles/global.css` | Colours and fonts (tokens at the top) |
| `src/lib/feeds.ts` | Substack, YouTube, ORCID and GitHub feeds |
| `public/images`, `public/files` | Uploaded headshot, images and CV |
