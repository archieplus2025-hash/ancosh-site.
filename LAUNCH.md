# Launch checklist

Build the live site with `python3 build.py --site=https://YOUR-DOMAIN` (no `--demo`). Upload or push the `dist` folder.
`python3 build.py --demo` rebuilds the clickable demo instead (never publish that one: it is marked noindex).

## 1. Replace the sample content (all of it is invented)
- [ ] Events: `src/pages/events.html` and the three rows in `src/pages/index.html`
- [ ] News: `src/pages/news.html`
- [ ] Leadership names and titles, and delete the "Sample names" line: `src/pages/leadership.html`
- [ ] Programs, Culture and Resources text and links: `src/pages/programs.html`, `culture.html`, `resources.html`
- [ ] Email and phone: `src/pages/contact.html` and the footer in `src/layout.html` (currently info@example.org and a 555 number)
- [ ] Social links: `SOCIAL` list at the top of `build.py` (currently the platforms' home pages)
- [ ] Links to features not built yet (Register, Volunteer, Join, Archive...) currently point to the Contact page in a launch build. Change their labels, for example "Register" to "Contact us to register", or remove them.

## 2. Decisions and approvals
- [ ] Hero illustration: confirm the Council has the right to use it, or replace `dist/assets/img/hero-arch.webp`
- [ ] Logo: a transparent PNG or SVG if one exists
- [ ] Dari text read by a fluent reader (`dist/assets/i18n.json`)
- [ ] Privacy policy and terms pages (the Council has none yet)
- [ ] Contact form: create a form service account (for example Formspree), paste its address into `data-endpoint` in `src/pages/contact.html`

## 3. Accounts, owned by the Council
- [ ] GitHub (Council email), repository with this folder, you as collaborator
- [ ] Cloudflare (Council email), Pages project connected to the repository, build command empty, output directory `dist`
- [ ] Domain: add it in the Pages dashboard first (Custom domains), then DNS as the dashboard instructs

## 4. Test on the live address
- [ ] Every page, English and Dari, phone and desktop
- [ ] Contact form delivers to a Council inbox
- [ ] Search, language switch, menu on a phone
- [ ] https works and the plain domain and `www` both reach the site

## 5. Later (not part of launch)
- [ ] Donations: Council legal entity, bank account, its own Stripe account, state charity registration check, then see "Donations with Stripe" in README.md
- [ ] Membership, voting and the rest: the real backend phase
