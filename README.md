# Afghanistan National Council of Sunni Hazaras: website (Phase 1)

Static site, English and Dari (right-to-left), no frameworks. Design: "Heritage & Story" (parchment, deep blue, terracotta; Cormorant Garamond, Lora, Amiri).

## Launch build and demo build
`python3 build.py --site=https://YOUR-DOMAIN` builds the live site (Phase 1 only) into `dist/`, with a sitemap and robots.txt. Follow `LAUNCH.md` before publishing.
`python3 build.py --demo` builds the clickable demo of Phase 2 and Phase 3 (membership, volunteer, event registration, donate, member login, dashboard, card, renewal, committees, documents, voting, directory, campaigns, archive, admin database, inbox, donations, reports) on sample data. It carries a "Demo preview" banner and is marked noindex. Never publish the demo build. The demo script lives in `src/demo.js`.
In a launch build, links to features that are not built yet point to the Contact page.

## Donations with Stripe
`functions/api/create-checkout-session.js` is a Cloudflare Pages Function. It creates a Stripe Checkout Session (one-time or monthly, card/wallet or US bank account) and sends the donor to Stripe's own page, so the website never handles card or bank details.
To turn it on: (1) the Council opens its own Stripe account (needs a legal entity, tax number and bank account first); (2) in Cloudflare Pages add the secret `STRIPE_SECRET_KEY` (start with a `sk_test_` key) and optionally `SITE_URL`; (3) set `checkoutEndpoint: "/api/create-checkout-session"` in `dist/assets/js/config.js`; (4) test with Stripe's test card 4242 4242 4242 4242, then switch to the live key. Bank-account (ACH) payments must be enabled in the Stripe Dashboard. Until the endpoint is set, the donate page shows a simulated checkout in demo mode and an "opening soon" message after launch.

## Demo logins
Member: zahra.noori@example.org / member2026. Administrator: admin@example.org / admin2026 (page `admin-login.html`). These work only in the demo. Real accounts need a backend.

## Folders
- `dist/` the finished site. This is the folder you deploy.
- `src/layout.html` the shared header, menu and footer.
- `src/pages/*.html` the content of each page.
- `build.py` rebuilds `dist/` from `src/` (`python3 build.py`). Social links are set at the top of this file.
- `dist/assets/i18n.json` all Dari text. English text lives in the page files.

## Preview on a computer
    python3 build.py
    cd dist && python3 -m http.server 8000
Open http://localhost:8000. (Opening the files by double-click will not load Dari or search; use the server.)

## Publish free on Cloudflare Pages
1. The client creates a GitHub account and a Cloudflare account in the Council's name.
2. Put this folder in a GitHub repository owned by the client (add the designer as a collaborator).
3. Cloudflare Pages, Create project, connect the repository.
4. Build command: leave empty. Build output directory: `dist`.
5. Deploy. The site is live on a free `.pages.dev` address. Add the real domain later under Custom domains.

## Still to fill in
- Replace every `[bracketed]` placeholder: events, news, leadership names, photos, email, phone.
- Social links in `build.py` (currently `#`).
- Contact form: set `data-endpoint` in `src/pages/contact.html` to a form service address (for example Formspree). Until then the form shows "not connected".
- Dari text was drafted by the designer. Have a fluent reader review it before launch.
- Privacy policy and terms pages (the client said they have none yet).
- Hero illustration `dist/assets/img/hero-arch.webp` came from the design concepts file; confirm the Council has the right to use it. Logo: replace `dist/assets/img/logo.jpg` with a transparent PNG or SVG when available.

## Roadmap (not built yet)
Phase 2: membership sign-up, volunteer form, event registration, newsletter, member profiles, donations.
Donations wait until the Council is a legal entity with its own bank account and payment account.

Phase 3: member login and dashboard, digital membership card, renewals, committee tools, internal documents, online voting, member database, reports, campaigns, archive.
Phase 3 needs a real backend (accounts, database, security review). Plan it as a separate project, and get legal advice on voting and member data first.
