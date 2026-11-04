# One-time setup: GitHub + Netlify + ancosh.org

1. **GitHub**: create a private repository (e.g. `ancosh-site`). Upload the contents of this folder. Add each Council editor under Settings > Collaborators with *Write* access.
2. **Repo name**: in `netlify.toml` replace `OWNER/REPO` with your repository (e.g. `ehsan/ancosh-site`) and commit.
3. **Netlify**: Add new project > Import from Git > pick the repo. Build command and publish directory come from `netlify.toml`.
4. **Editor login**: create a GitHub OAuth app (GitHub > Settings > Developer settings > OAuth Apps). Homepage URL: your site URL. Callback URL: `https://api.netlify.com/auth/done`. In Netlify: Project configuration > Access & security > OAuth > Install provider > GitHub, and paste the Client ID and Secret.
5. **Contact form**: Netlify > Forms > Form notifications > add an email notification to dehati@ancosh.org (the form is named `contact`).
6. **Domain**: Netlify > Domain management > Add a domain > `ancosh.org`. Then follow Netlify's instructions: either change the nameservers at Porkbun to Netlify's, or add the DNS records Netlify shows. HTTPS is issued automatically once DNS resolves.
7. **Go public**: the site is set to "noindex" while it holds sample content. When the real content is in, delete `ANCSH_NOINDEX` in `netlify.toml` and commit.

Before launch replace the sample news, events, leaders and resources through /admin.
