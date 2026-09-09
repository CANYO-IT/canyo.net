# CANYO Website

The source code for [canyo.net](https://canyo.net) — the public website for CANYO LLC, a veteran-owned managed IT services provider in Tucson, Arizona.

Built as a static site with hand-written HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no tracking beyond privacy-respecting analytics. Deployed via GitHub Pages.

## Why this is public

CANYO believes technical work should be inspectable where doing so doesn't expose client information or security secrets. If we ask clients to trust how we operate, the work we can show should be visible.

This repository contains the **public website only**. Client infrastructure, credentials, operational secrets, internal tooling, and private systems are intentionally excluded — that separation is itself part of how CANYO operates (see [Inside CANYO](https://canyo.net/inside-canyo/)).

## Structure

- `index.html` — homepage (services, process, first 30 days, example report, pricing, FAQ, reviews, contact)
- `inside-canyo/` — technical deep-dive: security principles, layered access model, incident response, automation boundaries
- `styles.css` — all styling, responsive across screen sizes, light/dark themes
- `app.js` — navigation, theme toggle, pricing calculator, scroll reveal, FAQ
- `legal/` — privacy policy and terms of service
- `llms.txt`, `robots.txt`, `sitemap.xml` — AI/search discoverability

## Contact

- contact@canyo.net
- (520) 336-7521
- Tucson, Arizona
