# Setup: GitHub Pages + ancosh.org (free)

1. **Repository.** Create a repo on GitHub and upload this folder. GitHub's free plan serves Pages only from a *public* repo, so the repo (not the editors' logins) is visible to everyone. Add Council editors under Settings > Collaborators with Write access.
2. **Turn on Pages.** Repo Settings > Pages > Source: **GitHub Actions**. Each push to `main` then builds and publishes the site (see `.github/workflows/deploy.yml`).
3. **Keep search engines out for now.** Settings > Secrets and variables > Actions > Variables: add `ANCSH_NOINDEX` = `1`. Change it to `0` (or delete it) at launch.
4. **Domain.** Settings > Pages > Custom domain: `ancosh.org`. At Porkbun set DNS as GitHub's Pages domain documentation says (A records for the bare domain, or a CNAME for `www`). Tick **Enforce HTTPS** once it becomes available.
5. **Editor login.** The /admin editor needs a small login helper: 
   - Create a free Cloudflare account > Workers > create a Worker and paste `worker/index.js`.
   - Create a GitHub OAuth app (Settings > Developer settings > OAuth Apps). Callback URL: `https://YOUR-WORKER-ADDRESS/callback`.
   - In the Worker add secrets `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
   - In the repo add the Actions variable `ANCSH_AUTH_URL` = `https://YOUR-WORKER-ADDRESS`, then re-run the Deploy workflow.
6. **Contact form.** With no service connected, the form opens the visitor's email app addressed to dehati@ancosh.org. To receive messages directly instead, create a form with a form service and set the Actions variable `ANCSH_FORM_URL` to its address.

Editors can also change content without /admin: edit the files in `content/` on GitHub directly.
