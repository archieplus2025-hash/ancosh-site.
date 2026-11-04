"""Turns the editable content in ./content (written by the /admin editor) into HTML for the static pages."""
import datetime
import html
import json
import re
from pathlib import Path

CONTENT = Path(__file__).parent / "content"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def esc(s):
    return html.escape(str(s if s is not None else ""), quote=True)


def settings():
    path = CONTENT / "settings.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def items(folder):
    out = []
    for p in sorted((CONTENT / folder).glob("*.json")):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except ValueError as e:  # a broken file must not take the whole site down
            print(f"WARNING: skipped {p.name}: {e}")
            continue
        if isinstance(d, dict):
            out.append(d)
    return out


def fmt_date(iso):
    try:
        y, m, d = (int(x) for x in str(iso)[:10].split("-"))
        datetime.date(y, m, d)
        return f"{MONTHS[m - 1]} {d}, {y}"
    except (ValueError, IndexError):
        return ""


def fa(d, key):
    v = d.get(key + "_fa")
    return f' data-fa="{esc(v)}"' if v else ""


def safe_href(url):
    url = str(url or "").strip()
    if re.match(r"^(https?://|mailto:|tel:|/|#|[a-z0-9_\-./]+\.html|[a-z0-9_\-./]+$)", url, re.I) and not re.match(r"^\s*(javascript|data|vbscript):", url, re.I):
        return url
    return ""


def link_attrs(url):
    return ' target="_blank" rel="noopener"' if re.match(r"^https?://", url, re.I) else ""


def contact_line(s):
    email = s.get("email", "")
    phone = s.get("phone", "")
    digits = re.sub(r"\D", "", phone)
    tel = ("+1" + digits) if len(digits) == 10 else ("+" + digits if len(digits) == 11 and digits[0] == "1" else digits)
    parts = []
    if email:
        parts.append(f'<a href="mailto:{esc(email)}">{esc(email)}</a>')
    if phone:
        parts.append(f'<a href="tel:{esc(tel)}">{esc(phone)}</a>')
    return " &middot; ".join(parts)


def social(s, fallback):
    keys = [("Facebook", "facebook"), ("Instagram", "instagram"), ("X", "x"), ("YouTube", "youtube")]
    out = []
    for name, k in keys:
        url = safe_href(s.get(k, ""))
        if url:
            out.append((name, url))
    return out or fallback


def event_row(e, demo, with_desc=True):
    when = [fmt_date(e.get("date"))]
    if e.get("time"):
        when.append(esc(e["time"]))
    if e.get("location"):
        when.append(esc(e["location"]))
    desc = ""
    if with_desc and e.get("description"):
        desc = f'<p{fa(e, "description")}>{esc(e["description"])}</p>'
    return (f'    <div class="ev" data-date="{esc(str(e.get("date", ""))[:10])}">'
            f'<span class="t"{fa(e, "title")}>{esc(e.get("title"))}</span><span class="leader"></span>'
            f'<span class="w">{" &middot; ".join(w for w in when if w)}</span>{desc}</div>')


EV_NONE = '    <p class="center ev-none" hidden data-i18n="ev.none">No upcoming events right now. Please check back soon.</p>'


def events_html(demo, home=False):
    evs = sorted(items("events"), key=lambda e: str(e.get("date", "")))
    rows = "\n".join(event_row(e, demo, with_desc=True) for e in evs)
    return rows + "\n" + EV_NONE


def events_note(demo):
    if demo:
        return '<p class="note"><a class="link" href="register.html">Register for an event</a></p>'
    return '<p class="note"><a class="link" href="contact.html" data-i18n="ev.ask">Questions about an event? Contact us</a></p>'


def news_html():
    ns = sorted(items("news"), key=lambda n: str(n.get("date", "")), reverse=True)
    if not ns:
        return '    <p class="center" data-i18n="news.none">No news has been posted yet.</p>'
    return "\n".join(
        f'    <div class="item"><div class="meta">{fmt_date(n.get("date"))}</div>'
        f'<h3{fa(n, "title")}>{esc(n.get("title"))}</h3><p{fa(n, "summary")}>{esc(n.get("summary"))}</p></div>'
        for n in ns)


def leaders_html():
    ls = sorted(items("leadership"), key=lambda p: (p.get("order") if isinstance(p.get("order"), (int, float)) else 999, str(p.get("name", ""))))
    out = []
    for p in ls:
        name = str(p.get("name", ""))
        photo = safe_href(p.get("photo", ""))
        if photo:
            pic = f'<img class="avatar-img" src="{esc(photo)}" alt="" width="96" height="96" loading="lazy">'
        else:
            pic = f'<div class="avatar" style="width:96px;height:96px;font-size:40px" aria-hidden="true">{esc(name[:1])}</div>'
        out.append(f'    <div class="person">{pic}<div class="name"{fa(p, "name")}>{esc(name)}</div>'
                   f'<div class="role"{fa(p, "role")}>{esc(p.get("role"))}</div></div>')
    return "\n".join(out) if out else '    <p class="center" data-i18n="lead.none">Leadership will be listed here soon.</p>'


def leaders_note(demo):
    return '<p class="note">Sample names for the demo. Real names, photos and short biographies replace these before launch.</p>' if demo else ""


CATS = [("Documents", "res.docs"), ("Reports", "res.reports"), ("Useful links", "res.links")]


def resources_html():
    rs = items("resources")
    cards = []
    for cat, key in CATS:
        rows = []
        for r in rs:
            if r.get("category") != cat:
                continue
            href = safe_href(r.get("file") or r.get("link"))
            t = f'<span{fa(r, "title")}>{esc(r.get("title"))}</span>'
            rows.append(f'<li><a href="{esc(href)}"{link_attrs(href)}>{t}</a></li>' if href else f"<li>{t}</li>")
        body = (f'<ul style="list-style:none;padding:0;margin:0;line-height:2">{"".join(rows)}</ul>' if rows
                else '<p class="small" data-i18n="res.none">Nothing has been posted here yet.</p>')
        cards.append(f'    <div class="card"><h3 data-i18n="{key}">{cat}</h3><div class="rule"></div>{body}</div>')
    return "\n".join(cards)


def netlify_form(demo, host="netlify", form_url=""):
    if demo:
        return "", "", ""
    if host != "netlify":
        return (form_url or "mailto"), "", ""
    return ("netlify",
            'data-netlify="true" netlify-honeypot="bot-field"',
            '<input type="hidden" name="form-name" value="contact">\n    <p hidden><label>Leave this empty: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>')


def render(page, demo, host="netlify", form_url=""):
    s = settings()
    endpoint, attrs, fields = netlify_form(demo, host, form_url)
    repl = {
        "{{events}}": events_html(demo),
        "{{home_events}}": events_html(demo, home=True),
        "{{events_note}}": events_note(demo),
        "{{news}}": news_html(),
        "{{leaders}}": leaders_html(),
        "{{leaders_note}}": leaders_note(demo),
        "{{resources}}": resources_html(),
        "{{contact_line}}": contact_line(s),
        "{{contact_email}}": esc(s.get("email", "")),
        "{{form_endpoint}}": endpoint,
        "{{netlify_attrs}}": attrs,
        "{{netlify_fields}}": fields,
    }
    for k, v in repl.items():
        page = page.replace(k, v)
    return page


ADMIN_HTML = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Council content editor</title>
</head>
<body>
<script src="https://unpkg.com/decap-cms@3.16.3/dist/decap-cms.js"></script>
</body>
</html>
"""

ADMIN_CONFIG = """# Content editor settings (generated by build.py). Edit the generator, not this file.
backend:
  name: github
  repo: %%REPO%%
  branch: main
%%AUTH%%site_url: %%SITE%%
display_url: %%SITE%%
media_folder: dist/assets/uploads
public_folder: /assets/uploads
locale: en
collections:
  - name: news
    label: News
    label_singular: News story
    folder: content/news
    create: true
    extension: json
    format: json
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    identifier_field: title
    summary: "{{date}}  {{title}}"
    sortable_fields: [date, title]
    fields:
      - { label: Headline, name: title, widget: string }
      - { label: Date, name: date, widget: datetime, format: "YYYY-MM-DD", date_format: "YYYY-MM-DD", time_format: false }
      - { label: Summary, name: summary, widget: text }
      - { label: Headline in Dari (optional), name: title_fa, widget: string, required: false }
      - { label: Summary in Dari (optional), name: summary_fa, widget: text, required: false }
  - name: events
    label: Events
    label_singular: Event
    folder: content/events
    create: true
    extension: json
    format: json
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    identifier_field: title
    summary: "{{date}}  {{title}}"
    sortable_fields: [date, title]
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Date, name: date, widget: datetime, format: "YYYY-MM-DD", date_format: "YYYY-MM-DD", time_format: false }
      - { label: Time (optional, for example 6:00 pm), name: time, widget: string, required: false }
      - { label: Location, name: location, widget: string, required: false }
      - { label: Description, name: description, widget: text, required: false }
      - { label: Title in Dari (optional), name: title_fa, widget: string, required: false }
      - { label: Description in Dari (optional), name: description_fa, widget: text, required: false }
  - name: leadership
    label: Leadership
    label_singular: Person
    folder: content/leadership
    create: true
    extension: json
    format: json
    slug: "{{slug}}"
    identifier_field: name
    summary: "{{order}}  {{name}}, {{role}}"
    fields:
      - { label: Name, name: name, widget: string }
      - { label: Title or role, name: role, widget: string }
      - { label: Order on the page (1 is first), name: order, widget: number, value_type: int, min: 1, default: 50 }
      - { label: Photo (optional), name: photo, widget: image, required: false }
      - { label: Name in Dari (optional), name: name_fa, widget: string, required: false }
      - { label: Title in Dari (optional), name: role_fa, widget: string, required: false }
  - name: resources
    label: Resources
    label_singular: Resource
    folder: content/resources
    create: true
    extension: json
    format: json
    slug: "{{slug}}"
    identifier_field: title
    summary: "{{category}}  {{title}}"
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Section, name: category, widget: select, options: ["Documents", "Reports", "Useful links"] }
      - { label: Web address (optional), name: link, widget: string, required: false, hint: "Start with https:// for another website, or use a page of this site such as about.html" }
      - { label: Or upload a file (optional), name: file, widget: file, required: false }
      - { label: Title in Dari (optional), name: title_fa, widget: string, required: false }
  - name: settings
    label: Contact details and social links
    files:
      - label: Contact details and social links
        name: settings
        file: content/settings.json
        format: json
        fields:
          - { label: Email address, name: email, widget: string }
          - { label: Phone number, name: phone, widget: string }
          - { label: Facebook address, name: facebook, widget: string, required: false }
          - { label: Instagram address, name: instagram, widget: string, required: false }
          - { label: X address, name: x, widget: string, required: false }
          - { label: YouTube address, name: youtube, widget: string, required: false }
"""
