/* Site behaviour: English/Dari-Farsi/Pashto switch (with right-to-left), mobile menu, search, contact form. No dependencies. */
(function () {
  'use strict';
  var dicts = { fa: {}, ps: {} };
  var lang = 'en';
  var LANGS = ['en', 'fa', 'ps'];
  function rtl() { return lang === 'fa' || lang === 'ps'; }

  function store(get, val) {
    try {
      if (get) return window.localStorage.getItem('lang');
      window.localStorage.setItem('lang', val);
    } catch (e) { return null; }
  }

  function t(key, fallback) {
    if (rtl() && dicts[lang][key]) return dicts[lang][key];
    return fallback;
  }

  function apply() {
    var root = document.documentElement;
    root.lang = lang;
    root.dir = rtl() ? 'rtl' : 'ltr';
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.dataset.enHtml === undefined) n.dataset.enHtml = n.innerHTML;
      if (rtl() && dicts[lang][n.dataset.i18n]) {
        n.textContent = dicts[lang][n.dataset.i18n];
      } else {
        n.innerHTML = n.dataset.enHtml;
      }
    }
    var fx = document.querySelectorAll('[data-fa],[data-ps]');
    for (var f = 0; f < fx.length; f++) {
      var x = fx[f];
      if (x.dataset.enText === undefined) x.dataset.enText = x.textContent;
      var alt = lang === 'fa' ? x.dataset.fa : (lang === 'ps' ? x.dataset.ps : '');
      x.textContent = alt || x.dataset.enText;
    }
    var ph = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < ph.length; j++) {
      var p = ph[j];
      if (p.dataset.en === undefined) p.dataset.en = p.getAttribute('placeholder') || '';
      p.setAttribute('placeholder', t(p.dataset.i18nPh, p.dataset.en));
    }
    var ar = document.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < ar.length; k++) {
      var a = ar[k];
      if (a.dataset.en === undefined) a.dataset.en = a.getAttribute('aria-label') || '';
      a.setAttribute('aria-label', t(a.dataset.i18nAria, a.dataset.en));
    }
    var btns = document.querySelectorAll('.lang button');
    for (var b = 0; b < btns.length; b++) {
      btns[b].setAttribute('aria-pressed', btns[b].dataset.lang === lang ? 'true' : 'false');
    }
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  function setLang(l) {
    lang = LANGS.indexOf(l) !== -1 ? l : 'en';
    store(false, lang);
    apply();
  }

  function initLang() {
    var q = new URLSearchParams(window.location.search).get('lang');
    var saved = store(true);
    lang = LANGS.indexOf(q) !== -1 ? q : (LANGS.indexOf(saved) !== -1 ? saved : 'en');
    var btns = document.querySelectorAll('.lang button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) { setLang(e.currentTarget.dataset.lang); });
    }
    fetch('assets/i18n.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { dicts.fa = d.fa || {}; dicts.ps = d.ps || {}; apply(); })
      .catch(function () { apply(); });
  }

  function initNav() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    if (file.indexOf('.') === -1) file = file + '.html';
    var links = document.querySelectorAll('.nav a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href === file || (file === 'index.html' && href === 'index.html')) {
        links[i].setAttribute('aria-current', 'page');
      }
    }
    var btn = document.querySelector('.menu-btn');
    var nav = document.getElementById('site-nav');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  function initSearch() {
    var box = document.getElementById('results');
    if (!box) return;
    var q = (new URLSearchParams(window.location.search).get('q') || '').trim();
    var input = document.querySelector('.search input[name="q"]');
    if (input) input.value = q;
    var index = [];

    function render() {
      box.textContent = '';
      var msg;
      if (!q) {
        msg = document.createElement('p');
        msg.className = 'center';
        msg.textContent = t('sr.prompt', 'Type a word to search.');
        box.appendChild(msg);
        return;
      }
      var needle = q.toLowerCase();
      var hits = index.filter(function (e) {
        return (e.text_en + ' ' + e.title_en + ' ' + e.text_fa + ' ' + e.title_fa + ' ' + (e.text_ps || '') + ' ' + (e.title_ps || '')).toLowerCase().indexOf(needle) !== -1;
      });
      if (!hits.length) {
        msg = document.createElement('p');
        msg.className = 'center';
        msg.textContent = t('sr.none', 'No results found.');
        box.appendChild(msg);
        return;
      }
      hits.forEach(function (e) {
        var item = document.createElement('div');
        item.className = 'item';
        var a = document.createElement('a');
        a.href = e.url;
        a.textContent = (lang === 'fa' && e.title_fa) ? e.title_fa : ((lang === 'ps' && e.title_ps) ? e.title_ps : e.title_en);
        var p = document.createElement('p');
        var body = (lang === 'fa' && e.text_fa) ? e.text_fa : ((lang === 'ps' && e.text_ps) ? e.text_ps : e.text_en);
        p.textContent = body.length > 160 ? body.slice(0, 157) + '...' : body;
        item.appendChild(a);
        item.appendChild(p);
        box.appendChild(item);
      });
    }

    fetch('search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { index = d; render(); })
      .catch(function () { render(); });
    document.addEventListener('langchange', render);
  }

  function initEvents() {
    var today = new Date();
    var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    var lists = document.querySelectorAll('.events');
    for (var i = 0; i < lists.length; i++) {
      var list = lists[i], max = parseInt(list.getAttribute('data-max') || '0', 10), shown = 0;
      var rows = list.querySelectorAll('.ev');
      for (var j = 0; j < rows.length; j++) {
        var d = rows[j].getAttribute('data-date') || '';
        var keep = d >= iso && (!max || shown < max);
        rows[j].hidden = !keep;
        if (keep) shown++;
      }
      var none = list.querySelector('.ev-none');
      if (none) none.hidden = shown > 0;
    }
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var msg = document.getElementById('form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var endpoint = form.getAttribute('data-endpoint');
      var name = (form.elements.name.value || '').trim(), email = (form.elements.email.value || '').trim(), text = (form.elements.message.value || '').trim();
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !text) {
        msg.textContent = t('con.invalid', 'Please fill in your name, a valid email address and a message.');
        return;
      }
      if (!endpoint && window.ANCSH_DEMO) {
        window.ANCSH_DEMO.saveContact({ name: name, email: email, text: text });
        form.reset();
        msg.textContent = t('con.thanks', 'Your message was sent. Thank you.');
        return;
      }
      if (endpoint === 'mailto') {
        var to = form.getAttribute('data-email') || '';
        window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Website message from ' + name) +
          '&body=' + encodeURIComponent(text + '\n\n' + name + ' <' + email + '>');
        msg.textContent = t('con.mailto', 'Your email app should open with your message. Please press send there.');
        return;
      }
      if (!endpoint) {
        msg.textContent = t('con.notready', 'This form is not connected yet. Please try again later.');
        return;
      }
      var req = endpoint === 'netlify'
        ? fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form)).toString() })
        : fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      req
        .then(function (r) {
          if (!r.ok) throw new Error('bad');
          form.reset();
          msg.textContent = t('con.thanks', 'Your message was sent. Thank you.');
        })
        .catch(function () { msg.textContent = t('con.error', 'Could not send. Please try again.'); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initLang();
    initSearch();
    initEvents();
    initForm();
  });
})();
