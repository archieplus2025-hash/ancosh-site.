#!/usr/bin/env python3
"""Builds the static site into ./dist from src/layout.html and src/pages/*.html.

Run:  python3 build.py
Then upload / deploy the ./dist folder (Cloudflare Pages: build command empty, output directory dist).
Edit SOCIAL below to set the social media links.
"""
import html
import json
import os
import re
import shutil
import sys
from pathlib import Path

import content

ROOT = Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
ORG = "Afghanistan National Council of Sunni Hazaras"

# Social media links. Replace "#" with the real address once the accounts exist.
SOCIAL = [
    ("Facebook", "https://www.facebook.com/"),
    ("Instagram", "https://www.instagram.com/"),
    ("X", "https://x.com/"),
    ("YouTube", "https://www.youtube.com/"),
]

# slug, i18n key for nav label, English nav label, meta description
NAV_PAGES = [
    ("index", "nav.home", "Home", "Identity, culture, unity and social engagement for Afghanistan's Sunni Hazara community."),
    ("about", "nav.about", "About", "About the Afghanistan National Council of Sunni Hazaras: mission, who we serve and where we work."),
    ("leadership", "nav.leadership", "Leadership", "The people who guide the Afghanistan National Council of Sunni Hazaras."),
    ("programs", "nav.programs", "Programs", "The Council's programs for heritage, solidarity, advocacy, participation and coexistence."),
    ("news", "nav.news", "News", "News and announcements from the Afghanistan National Council of Sunni Hazaras."),
    ("events", "nav.events", "Events", "Upcoming gatherings and events of the Council."),
    ("resources", "nav.resources", "Resources", "Documents, reports and useful links from the Council."),
    ("culture", "nav.culture", "Culture & Heritage", "Preserving and sharing the cultural and historical heritage of Afghanistan's Sunni Hazaras."),
    ("contact", "nav.contact", "Contact", "Contact the Afghanistan National Council of Sunni Hazaras."),
    ("join", "nav.join", "Get Involved", "Become a member, volunteer, register for events and join the newsletter."),
    ("donate", "nav.donate", "Donate", "Support the work of the Council."),
]

# Default build = the real launch site (Phase 1). `python3 build.py --demo` builds the clickable demo of
# Phase 2 and Phase 3 instead (sample data, "Demo" banner on every page).
DEMO = "--demo" in sys.argv
# The live web address, used for the sitemap and robots.txt. Set it here or run:
#   python3 build.py --site=https://example.org
SITE_URL = os.environ.get("ANCSH_SITE_URL", "").rstrip("/")
# The GitHub repository the /admin editor saves to, as owner/name. Set it here or run: python3 build.py --repo=owner/name
REPO = os.environ.get("ANCSH_REPO", "")
# NOINDEX keeps search engines away (use it while the site holds sample content): --noindex or ANCSH_NOINDEX=1
NOINDEX = os.environ.get("ANCSH_NOINDEX") == "1" or "--noindex" in sys.argv or DEMO
# Address of the small login helper (see worker/). Needed for the /admin GitHub login when not hosted on Netlify.
AUTH_URL = os.environ.get("ANCSH_AUTH_URL", "").rstrip("/")
# Optional contact-form service address (for example a Formspree form URL). If empty, the form opens the visitor's email app.
FORM_URL = os.environ.get("ANCSH_FORM_URL", "")
HOST = os.environ.get("ANCSH_HOST", "netlify")  # "netlify" or "github"
for _a in sys.argv:
    if _a.startswith("--site="):
        SITE_URL = _a.split("=", 1)[1].rstrip("/")
    elif _a.startswith("--repo="):
        REPO = _a.split("=", 1)[1]
# slug, title, description, in member-portal sub menu
DEMO_PAGES = [
    ("volunteer", "Volunteer", "Offer your time to the Council.", False),
    ("register", "Event registration", "Register for a Council event.", False),
    ("login", "Member login", "Sign in to the member area.", False),
    ("dashboard", "Member dashboard", "Your membership at a glance.", True),
    ("card", "Digital membership card", "Your digital membership card.", True),
    ("renew", "Renew membership", "Renew your membership online.", True),
    ("committees", "Committees", "Committee members, meetings and tasks.", True),
    ("documents", "Internal documents", "Documents for members and committees.", True),
    ("vote", "Online voting", "Cast your ballot in Council elections and motions.", True),
    ("directory", "Member directory", "Member profiles.", True),
    ("campaigns", "Campaigns", "Fundraising and outreach campaigns.", True),
    ("archive", "Archive", "The Council's archive of events, documents and media.", True),
    ("admin", "Member database", "Manage the member database.", True),
    ("inbox", "Inbox", "Messages, volunteers and event registrations.", True),
    ("donations", "Donations", "Gifts received through the website.", True),
    ("admin-login", "Administrator login", "Sign in to administration.", False),
    ("reports", "Reports and analytics", "Membership, event and giving reports.", True),
]
PORTAL_MENU = [
    ("dashboard", "Dashboard"), ("card", "My card"), ("renew", "Renew"), ("committees", "Committees"),
    ("documents", "Documents"), ("vote", "Vote"), ("directory", "Directory"), ("campaigns", "Campaigns"),
    ("archive", "Archive"), None, ("admin", "Members", True), ("inbox", "Inbox", True), ("donations", "Donations", True), ("reports", "Reports", True),
]
if not DEMO:  # the membership hub only exists in the demo until the real features are built
    NAV_PAGES = [p for p in NAV_PAGES if p[0] != "join"]

BANNER = ('<div class="demo-banner" role="note"><strong>Demo preview</strong>'
          '<span>Sample data only. Nothing is sent, charged or stored on a server.</span>'
          '<button type="button" id="demo-reset">Reset demo data</button></div>')
EXTRA_PAGES = [
    ("search", "sr.h1", "Search results", "Search the site."),
    ("404", "nf.h1", "Page not found", "Page not found."),
]

fa = json.loads((DIST / "assets" / "i18n.json").read_text(encoding="utf-8"))["fa"]
layout = (SRC / "layout.html").read_text(encoding="utf-8")
if DEMO:
    layout = layout.replace("</head>", '<script src="assets/js/demo.js" defer></script>\n</head>')
if not DEMO:  # no member area at launch: drop its links (login pages)
    layout = "\n".join(l for l in layout.splitlines() if "login.html" not in l)


def nav_items(cls_attr=""):
    return "\n".join(
        f'      <li><a href="{slug}.html" data-i18n="{key}">{label}</a></li>'
        for slug, key, label, _ in NAV_PAGES
        if slug != "donate"  # Donate is a button in the top bar
    )


def footer_links():
    return "\n".join(
        f'    <a href="{slug}.html" data-i18n="{key}">{label}</a>'
        for slug, key, label, _ in NAV_PAGES
    )


def social_links():
    return "\n".join(
        f'    <a href="{html.escape(url, quote=True)}" rel="noopener" target="_blank">{name}</a>' for name, url in content.social(content.settings(), SOCIAL)
    )


def portal_nav(current):
    out = ['<nav class="subnav" aria-label="Member area">']
    for item in PORTAL_MENU:
        if item is None:
            out.append('<span class="sep" data-admin aria-hidden="true"></span>')
        else:
            adm = " data-admin" if len(item) > 2 else ""
            out.append(f'<a href="{item[0]}.html"{adm}>{item[1]}</a>')
    out.append('<span class="who" id="whoami"></span></nav>')
    return "".join(out)


ROBOTS_META = '<meta name="robots" content="noindex, nofollow">\n' if NOINDEX else ""


def plain(text):
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


# Keep the demo script and demo pages out of a launch build.
_demo_js = DIST / "assets" / "js" / "demo.js"
if DEMO:
    shutil.copyfile(SRC / "demo.js", _demo_js)
else:
    _demo_js.unlink(missing_ok=True)
    for _s in [p[0] for p in DEMO_PAGES] + ["join"]:
        (DIST / f"{_s}.html").unlink(missing_ok=True)

index = []
for slug, key, label, desc in NAV_PAGES + EXTRA_PAGES:
    body = (SRC / "pages" / f"{slug}.html").read_text(encoding="utf-8")
    if not DEMO:  # links to demo-only features go to the contact page until those features are built
        body = re.sub(r'href="(?:register|volunteer|join|archive|documents|campaigns|vote)\.html[^"]*"', 'href="contact.html"', body)
    title = ORG if slug == "index" else f"{label} | {ORG}"
    page = (
        layout.replace("{{title}}", html.escape(title))
        .replace("{{description}}", html.escape(desc, quote=True))
        .replace("{{social}}", social_links())
        .replace("{{nav}}", nav_items())
        .replace("{{footer_links}}", footer_links())
        .replace("{{banner}}", BANNER if DEMO else "")
        .replace("{{robots}}", ROBOTS_META)
        .replace("{{content}}", body)
    )
    page = content.render(page, DEMO, HOST, FORM_URL)
    out = "404.html" if slug == "404" else f"{slug}.html"
    (DIST / out).write_text(page, encoding="utf-8")
    if (slug, key, label, desc) in NAV_PAGES:
        keys = re.findall(r'data-i18n="([^"]+)"', body)
        fa_text = " ".join(dict.fromkeys([fa[k] for k in keys if k in fa] + [html.unescape(v) for v in re.findall(r'data-fa="([^"]*)"', page)]))
        index.append(
            {
                "url": f"{slug}.html",
                "title_en": label,
                "title_fa": fa.get(key, ""),
                "text_en": plain(re.sub(r"{{[a-z_]+}}", " ", body)) if False else plain(re.sub(r"<head>.*?</head>|<header.*?</header>|<footer.*?</footer>", " ", page, flags=re.S)),
                "text_fa": fa_text,
            }
        )

if DEMO:
    for slug, label, desc, portal in DEMO_PAGES:
        body = (SRC / "pages" / f"{slug}.html").read_text(encoding="utf-8")
        if portal:
            body = portal_nav(slug) + body
        page = (
            layout.replace("{{title}}", html.escape(f"{label} | {ORG}"))
            .replace("{{description}}", html.escape(desc, quote=True))
            .replace("{{social}}", social_links())
            .replace("{{nav}}", nav_items())
            .replace("{{footer_links}}", footer_links())
            .replace("{{banner}}", BANNER)
            .replace("{{robots}}", ROBOTS_META)
            .replace("{{content}}", body)
        )
        page = content.render(page, DEMO, HOST, FORM_URL)
        (DIST / f"{slug}.html").write_text(page, encoding="utf-8")
        index.append({"url": f"{slug}.html", "title_en": label, "title_fa": "", "text_en": label + ". " + desc, "text_fa": ""})

(DIST / "search-index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
pages_built = [s for s, *_ in NAV_PAGES] + ([p[0] for p in DEMO_PAGES] if DEMO else [])
robots = "User-agent: *\nAllow: /\n"
if SITE_URL and not NOINDEX:
    urls = "".join(f"  <url><loc>{SITE_URL}/{'' if s == 'index' else s + '.html'}</loc></url>\n" for s in pages_built if s != "search")
    (DIST / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n", encoding="utf-8")
    robots += f"Sitemap: {SITE_URL}/sitemap.xml\n"
else:
    (DIST / "sitemap.xml").unlink(missing_ok=True)
if NOINDEX:
    robots = "User-agent: *\nDisallow: /\n"
(DIST / "robots.txt").write_text(robots, encoding="utf-8")

headers = """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=86400

/admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store
"""
if NOINDEX:
    headers += "\n/*\n  X-Robots-Tag: noindex, nofollow\n"
(DIST / "_headers").write_text(headers, encoding="utf-8")
if HOST == "github" and SITE_URL:
    (DIST / "CNAME").write_text(SITE_URL.split("://")[-1] + "\n", encoding="utf-8")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")

# the content editor at /admin
(DIST / "admin").mkdir(exist_ok=True)
(DIST / "admin" / "index.html").write_text(content.ADMIN_HTML, encoding="utf-8")
(DIST / "admin" / "config.yml").write_text(
    content.ADMIN_CONFIG.replace("%%AUTH%%", f"  base_url: {AUTH_URL}\n  auth_endpoint: auth\n" if AUTH_URL else "").replace("%%REPO%%", REPO or "OWNER/REPO").replace("%%SITE%%", SITE_URL or "https://ancosh.org"), encoding="utf-8")
if not REPO:
    print("NOTE: no GitHub repository set for /admin. Run with --repo=owner/name (or set ANCSH_REPO).")
print(f"Built {len(NAV_PAGES) + len(EXTRA_PAGES) + (len(DEMO_PAGES) if DEMO else 0)} pages into {DIST}")
