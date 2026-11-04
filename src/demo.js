/* DEMO ONLY: clickable mock-up of the Phase 2 and Phase 3 features, running on sample data in the browser.
   Nothing here talks to a server. Delete this file (and set DEMO = False in build.py) for the real launch. */
(function () {
  'use strict';

  var KEY = 'ancsh_demo_v1';
  var TODAY = '2026-11-02';
  var mem = null;

  /* ---------- small helpers ---------- */
  function h(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') e.textContent = v;
      else if (k === 'class') e.className = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(parent, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(parent, x); });
    else parent.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmt(iso) {
    if (!iso) return 'Not set';
    var p = iso.split('-');
    return MONTHS[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0];
  }
  function addYears(iso, n) {
    var p = iso.split('-');
    return (+p[0] + n) + '-' + p[1] + '-' + p[2];
  }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function validEmail(s) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s); }
  function param(name) { return new URLSearchParams(window.location.search).get(name); }

  /* ---------- sample data ---------- */
  function seed() {
    var first = ['Zahra', 'Ali', 'Maryam', 'Hassan', 'Fatima', 'Reza', 'Leila', 'Omid', 'Sima', 'Javad', 'Narges', 'Karim'];
    var last = ['Noori', 'Ahmadi', 'Rezaei', 'Karimi', 'Hashemi', 'Sadeghi', 'Amiri', 'Rahimi', 'Sultani', 'Faizi', 'Yaqoobi', 'Bahrami'];
    var cities = ['Falls Church, VA', 'Sacramento, CA', 'Dallas, TX', 'Toronto, Canada', 'Hamburg, Germany', 'London, UK', 'Sydney, Australia', 'Istanbul, Turkey'];
    var types = ['Individual', 'Family', 'Student', 'Supporter'];
    var bios = ['Teacher and amateur historian. Happy to help with Dari and English translation.',
      'Software engineer. Volunteers with the website and social media.',
      'Community organiser. Loves bringing families together for gatherings.',
      'Student of public health. Interested in youth programs.'];
    var comms = ['Culture & Heritage', 'Outreach & Solidarity', 'Youth & Education', 'Finance & Governance', ''];
    var members = [{ id: 'ANCSH-0000', name: 'Council Administrator', email: 'admin@example.org', city: 'Falls Church, VA', type: 'Individual', status: 'active', joined: '2015-06-01', expires: '2027-06-01', directory: false, bio: '', committee: '' }];
    for (var i = 0; i < 28; i++) {
      var status = i % 9 === 4 ? 'pending' : (i % 7 === 6 ? 'expired' : 'active');
      var month = (i * 3) % 12 + 1;
      var year = i < 16 ? 2026 : (i % 2 ? 2025 : 2024);
      if (year === 2026 && month > 10) month = 10;
      var nm = first[i % 12] + ' ' + last[(i * 5 + Math.floor(i / 12)) % 12];
      members.push({
        id: 'ANCSH-' + pad(i + 1, 4), name: nm,
        email: nm.toLowerCase().replace(/ /g, '.') + '@example.org',
        city: cities[i % 8], type: types[i % 4], status: status,
        joined: year + '-' + pad(month, 2) + '-10',
        expires: status === 'pending' ? '' : (status === 'expired' ? '2026-' + pad(1 + i % 8, 2) + '-15' : '2027-' + pad(month, 2) + '-15'),
        directory: i % 3 !== 2, bio: bios[i % 4], committee: comms[i % 5]
      });
    }
    members[1].expires = '2027-03-20';
    members[1].status = 'active';
    members[1].type = 'Individual';
    members[1].committee = 'Culture & Heritage';
    members[1].joined = '2024-03-20';
    return {
      v: 2, role: null, me: null, members: members,
      events: [
        { id: 'e1', title: 'Yalda Night Gathering', date: '2026-12-20', place: '[Venue], Falls Church, VA', desc: 'The longest night: poetry, fruit and family.', cap: 120, reg: 74 },
        { id: 'e2', title: 'Youth Language Circle', date: '2027-01-16', place: 'Online', desc: 'Dari and Hazaragi conversation for ages 12 to 18.', cap: 40, reg: 22 },
        { id: 'e3', title: 'Nowruz Celebration', date: '2027-03-20', place: '[Venue]', desc: 'New Year at the spring equinox, open to all families.', cap: 250, reg: 131 },
        { id: 'e4', title: 'Annual General Assembly', date: '2027-05-08', place: '[Venue] and online', desc: 'Annual reports, elections and member motions.', cap: 300, reg: 48 }
      ],
      regs: [
        { event: 'e1', name: 'Fatima Hashemi', email: 'fatima.hashemi@example.org', guests: 4, code: 'REG-4K2QA' },
        { event: 'e3', name: 'Omid Rahimi', email: 'omid.rahimi@example.org', guests: 2, code: 'REG-9PLM3' },
        { event: 'e1', name: 'Sima Bahrami', email: 'sima.bahrami@example.org', guests: 1, code: 'REG-7XD0F' }
      ],
      volunteers: [
        { name: 'Javad Amiri', email: 'javad.amiri@example.org', areas: ['Website and social media'], avail: 'Weekends', date: '2026-10-12' },
        { name: 'Narges Faizi', email: 'narges.faizi@example.org', areas: ['Translation (Dari and English)', 'Archive and research'], avail: 'Weekday evenings', date: '2026-10-19' },
        { name: 'Reza Sultani', email: 'reza.sultani@example.org', areas: ['Events and hospitality'], avail: 'Flexible', date: '2026-10-27' }
      ],
      messages: [
        { name: 'Sara Ahmadi', email: 'sara.ahmadi@example.org', text: 'Hello, can my family of five attend Yalda night? We are travelling from Baltimore.', date: '2026-10-31', done: false },
        { name: 'Daud Yaqoobi', email: 'daud.yaqoobi@example.org', text: 'We run a community library and would like to talk about sharing archive scans.', date: '2026-10-28', done: false },
        { name: 'Parisa Noori', email: 'parisa.noori@example.org', text: 'Thank you for the welcome call. How do I join the Youth committee?', date: '2026-10-20', done: true }
      ],
      donations: [
        { d: '2026-10-29', name: 'Anonymous', amt: 100, freq: 'once', camp: 'c1', method: 'card' },
        { d: '2026-10-24', name: 'Hassan Karimi', amt: 50, freq: 'monthly', camp: 'general', method: 'card' },
        { d: '2026-10-17', name: 'Maryam Rezaei', amt: 250, freq: 'once', camp: 'c3', method: 'us_bank_account' },
        { d: '2026-10-09', name: 'Anonymous', amt: 25, freq: 'once', camp: 'c2', method: 'card' },
        { d: '2026-09-30', name: 'Karim Amiri', amt: 100, freq: 'monthly', camp: 'general', method: 'us_bank_account' }
      ],
      subs: 143, renewals: [],
      committees: [
        { id: 'k1', name: 'Culture & Heritage', chair: 'Zahra Noori', meets: 'First Tuesday, 7:00 pm', next: '2026-12-01', blurb: 'Archive, oral history and cultural events.',
          tasks: [{ t: 'Catalogue the donated photo collection', done: true }, { t: 'Draft the Yalda Night programme', done: false }, { t: 'Record three oral-history interviews', done: false }] },
        { id: 'k2', name: 'Outreach & Solidarity', chair: 'Hassan Karimi', meets: 'Second Thursday, 7:30 pm', next: '2026-11-12', blurb: 'Community partnerships and member welcome.',
          tasks: [{ t: 'Welcome calls for new members', done: false }, { t: 'Update the partner organisations list', done: true }] },
        { id: 'k3', name: 'Youth & Education', chair: 'Maryam Rezaei', meets: 'Alternate Sundays, 4:00 pm', next: '2026-11-15', blurb: 'Language circles and mentoring.',
          tasks: [{ t: 'Plan the spring language circle', done: false }, { t: 'Collect volunteer tutor sign-ups', done: false }, { t: 'Reading list for ages 8 to 12', done: true }] },
        { id: 'k4', name: 'Finance & Governance', chair: 'Karim Amiri', meets: 'Last Monday, 8:00 pm', next: '2026-11-30', blurb: 'Budget, bylaws and the election.',
          tasks: [{ t: 'Prepare the 2027 budget draft', done: false }, { t: 'Review bylaws for the vote', done: false }] }
      ],
      documents: [
        { id: 'd1', title: 'Annual Report 2025', cat: 'Reports', access: 'All members', date: '2026-03-02', ex: 'A year in review: gatherings held, members welcomed and what comes next. (Sample text.)' },
        { id: 'd2', title: 'General Assembly Minutes, May 2026', cat: 'Minutes', access: 'All members', date: '2026-05-20', ex: 'Attendance, motions raised and decisions recorded. (Sample text.)' },
        { id: 'd3', title: 'Bylaws (current draft)', cat: 'Governance', access: 'All members', date: '2026-09-14', ex: 'Article 1: Name and purpose. Article 2: Membership. (Sample text.)' },
        { id: 'd4', title: 'Volunteer Handbook', cat: 'Guides', access: 'All members', date: '2026-02-11', ex: 'How events run, who to call, and how to welcome guests. (Sample text.)' },
        { id: 'd5', title: 'Committee Charter Template', cat: 'Governance', access: 'Committees', date: '2026-04-05', ex: 'Purpose, members, meeting rhythm and reporting. (Sample text.)' },
        { id: 'd6', title: 'Event Budget Worksheet', cat: 'Forms', access: 'Committees', date: '2026-06-18', ex: 'Venue, food, printing and contingency lines. (Sample text.)' },
        { id: 'd7', title: 'Board Minutes, October 2026', cat: 'Minutes', access: 'Board', date: '2026-10-28', ex: 'Confidential discussion of the 2027 budget. (Sample text.)' },
        { id: 'd8', title: 'Draft 2027 Budget', cat: 'Finance', access: 'Board', date: '2026-10-30', ex: 'Income and expenditure projections. (Sample text.)' }
      ],
      ballot: {
        title: '2027 Board election and motions', closes: '2026-12-05',
        items: [
          { id: 'b1', type: 'multi', max: 3, q: 'Elect three Board members', opts: ['Candidate A (sample)', 'Candidate B (sample)', 'Candidate C (sample)', 'Candidate D (sample)', 'Candidate E (sample)'] },
          { id: 'b2', type: 'single', q: 'Motion 1: Hold the Annual General Assembly in a hybrid format', opts: ['Yes', 'No', 'Abstain'] }
        ],
        tally: { b1: { 'Candidate A (sample)': 31, 'Candidate B (sample)': 24, 'Candidate C (sample)': 38, 'Candidate D (sample)': 17, 'Candidate E (sample)': 29 }, b2: { Yes: 39, No: 9, Abstain: 4 } },
        voters: 52, voted: {}
      },
      campaigns: [
        { id: 'c1', title: 'Heritage Archive Digitisation', goal: 12000, raised: 4850, ends: '2027-02-28', desc: 'Scan and preserve photographs, letters and recordings so they outlive the paper.' },
        { id: 'c2', title: 'Youth Language Circles', goal: 6000, raised: 2210, ends: '2027-01-31', desc: 'Free Dari and Hazaragi circles for young people, led by volunteers.' },
        { id: 'c3', title: 'Winter Gathering Fund', goal: 9000, raised: 7340, ends: '2026-12-15', desc: 'Helps families who cannot travel join the winter gathering.' }
      ],
      giving: [420, 610, 540, 880, 1260, 740],
      archive: [
        { y: 2015, t: 'Event', n: 'Founding assembly', d: 'The gathering at which the Council was founded.' },
        { y: 2016, t: 'Document', n: 'First constitution draft', d: 'Scanned draft with handwritten margin notes.' },
        { y: 2017, t: 'Photo', n: 'Nowruz in the park', d: 'Photo set, 48 images.' },
        { y: 2018, t: 'Recording', n: 'Poetry evening', d: 'Audio recording, 1 hour 20 minutes.' },
        { y: 2019, t: 'Event', n: 'Community forum on participation', d: 'Notes and attendee list.' },
        { y: 2020, t: 'Document', n: 'Pandemic response bulletin', d: 'Guidance shared with members in two languages.' },
        { y: 2021, t: 'Recording', n: 'Oral history: first interview', d: 'Interview with a founding member.' },
        { y: 2022, t: 'Photo', n: 'Yalda night', d: 'Photo set, 62 images.' },
        { y: 2023, t: 'Event', n: 'Youth mentoring launch', d: 'Programme and sign-up sheet.' },
        { y: 2024, t: 'Document', n: 'Annual report 2023', d: 'Published report, PDF.' },
        { y: 2025, t: 'Recording', n: 'Assembly livestream', d: 'Full recording of the General Assembly.' },
        { y: 2026, t: 'Photo', n: 'Nowruz 2026', d: 'Photo set, 85 images.' }
      ],
      notices: [
        { d: '2026-10-30', t: 'Voting opens for the 2027 Board election and motions. Ballots close December 5.' },
        { d: '2026-10-22', t: 'Yalda Night registration is open. Seats are limited.' },
        { d: '2026-10-05', t: 'New member welcome calls begin this month. Volunteers welcome.' }
      ]
    };
  }

  function load() {
    try { var s = window.localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) { /* ignore */ }
    return mem;
  }
  function save(st) {
    mem = st;
    try { window.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignore */ }
  }
  var S = load();
  if (!S || S.v !== 2) { S = seed(); save(S); }
  function commit() { save(S); }
  function me() { return S.members.filter(function (m) { return m.id === S.me; })[0] || null; }

  /* ---------- shared UI pieces ---------- */
  function field(label, id, type, opts) {
    opts = opts || {};
    var input;
    if (type === 'select') {
      input = h('select', { id: id, name: id }, opts.options.map(function (o) { return h('option', { value: o.value, text: o.label }); }));
    } else if (type === 'textarea') {
      input = h('textarea', { id: id, name: id, placeholder: opts.ph });
    } else {
      input = h('input', { id: id, name: id, type: type, placeholder: opts.ph, autocomplete: opts.ac, value: opts.value, min: opts.min, max: opts.max });
    }
    return h('div', { class: 'fld' }, h('label', { for: id, text: label }), input);
  }
  function choice(name, kind, items, checked, extra) {
    return items.map(function (it) {
      var inp = h('input', { type: kind, name: name, value: it.value });
      if (checked && checked.indexOf(it.value) !== -1) inp.checked = true;
      if (extra) inp.addEventListener('change', extra);
      return h('label', { class: 'opt' }, inp, h('span', null, it.label, it.sub ? h('small', { text: it.sub }) : null));
    });
  }
  function val(form, name) {
    var e = form.elements[name];
    return e ? (e.value || '').trim() : '';
  }
  function checkedVals(form, name) {
    return Array.prototype.filter.call(form.querySelectorAll('input[name="' + name + '"]'), function (i) { return i.checked; }).map(function (i) { return i.value; });
  }
  function notice(text, ok) { return h('p', { class: 'notice' + (ok ? ' ok' : ''), role: 'status', text: text }); }
  function chipFor(status) {
    var cls = status === 'active' ? 'ok' : (status === 'pending' ? 'warn' : 'bad');
    return h('span', { class: 'chip ' + cls, text: status });
  }
  function needSignIn(root, admin) {
    clear(root);
    if (admin) {
      root.appendChild(h('div', { class: 'panel narrow center' }, h('h2', { text: 'Administrators only' }),
        h('p', { text: S.role ? 'Your account is a member account. This page is for Council administrators.' : 'Please sign in with an administrator account.' }),
        h('a', { class: 'btn deep', href: 'admin-login.html', text: 'Administrator login' })));
    } else {
      root.appendChild(h('div', { class: 'panel narrow center' }, h('h2', { text: 'Please sign in' }),
        h('p', { text: 'This part of the site is for members.' }),
        h('a', { class: 'btn', href: 'login.html', text: 'Go to member login' })));
    }
  }
  function guard(root, admin) {
    if (!S.role || (admin && S.role !== 'admin')) { needSignIn(root, admin); return false; }
    return true;
  }
  function hbars(rows, max) {
    max = max || Math.max.apply(null, rows.map(function (r) { return r[1]; })) || 1;
    return h('div', { class: 'hbars' }, rows.map(function (r) {
      return h('div', { class: 'r' }, h('b', { text: r[0] }), h('div', { class: 'bar' }, h('i', { style: 'width:' + Math.round(r[1] / max * 100) + '%' })), h('span', { text: String(r[2] !== undefined ? r[2] : r[1]) }));
    }));
  }
  function vbars(labels, values, fmtv) {
    var max = Math.max.apply(null, values) || 1;
    return h('div', null,
      h('div', { class: 'vbars', role: 'img', 'aria-label': labels.map(function (l, i) { return l + ' ' + values[i]; }).join(', ') },
        values.map(function (v) { return h('div', { class: 'c' }, h('span', { text: fmtv ? fmtv(v) : v }), h('i', { style: 'height:' + Math.round(v / max * 120) + 'px' })); })),
      h('div', { class: 'vlabels' }, labels.map(function (l) { return h('span', { text: l }); })));
  }
  function qrSvg(seedText) {
    var n = 21, hsh = 2166136261;
    for (var i = 0; i < seedText.length; i++) { hsh ^= seedText.charCodeAt(i); hsh = Math.imul(hsh, 16777619) >>> 0; }
    function rnd() { hsh ^= hsh << 13; hsh >>>= 0; hsh ^= hsh >>> 17; hsh ^= hsh << 5; hsh >>>= 0; return hsh / 4294967296; }
    var rects = '';
    function finder(x, y) {
      return '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#14486e"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#14486e"/>';
    }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var inF = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inF && rnd() > 0.52) rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#14486e"/>';
    }
    rects += finder(0, 0) + finder(14, 0) + finder(0, 14);
    var wrap = document.createElement('div');
    wrap.className = 'qr';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Sample verification code (not scannable)');
    wrap.innerHTML = '<svg viewBox="0 0 21 21" shape-rendering="crispEdges" aria-hidden="true">' + rects + '</svg>';
    return wrap;
  }

  /* ---------- page renderers ---------- */
  var R = {};

  R.join = function (root) {
    var typeItems = [
      { value: 'Individual', label: 'Individual', sub: '$25 a year (sample price)' },
      { value: 'Family', label: 'Family', sub: '$40 a year (sample price)' },
      { value: 'Student', label: 'Student', sub: '$10 a year (sample price)' },
      { value: 'Supporter', label: 'Supporter', sub: '$100 a year (sample price)' }
    ];
    var msg = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true, id: 'member-form' },
      h('div', null, h('p', { class: 'legend', text: 'Membership type' }), h('div', { class: 'optlist' }, choice('type', 'radio', typeItems, ['Individual']))),
      h('div', { class: 'frow' }, field('Full name', 'name', 'text', { ac: 'name' }), field('Email', 'email', 'email', { ac: 'email' })),
      h('div', { class: 'frow' }, field('Phone (optional)', 'phone', 'tel', { ac: 'tel' }), field('City and country', 'city', 'text', { ph: 'For example: Falls Church, VA', ac: 'address-level2' })),
      h('label', { class: 'small' }, h('input', { type: 'checkbox', name: 'dir', checked: true }), ' List me in the member directory (members only).'),
      h('div', null, h('button', { class: 'btn', type: 'submit', text: 'Submit application' })),
      msg);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = val(form, 'name'), email = val(form, 'email');
      clear(msg);
      if (!name || !validEmail(email)) { msg.appendChild(notice('Please enter your name and a valid email address.')); return; }
      var id = 'ANCSH-' + pad(S.members.length, 4);
      S.members.push({ id: id, name: name, email: email, city: val(form, 'city') || 'Not given', type: checkedVals(form, 'type')[0] || 'Individual', status: 'pending', joined: TODAY, expires: '', directory: form.elements.dir.checked, bio: '', committee: '' });
      S.role = 'member'; S.me = id; commit();
      window.location.href = 'dashboard.html?welcome=1';
    });
    var subMsg = h('div', { 'aria-live': 'polite' });
    var sub = h('form', { class: 'stack', novalidate: true },
      field('Email', 'subemail', 'email', { ac: 'email' }),
      h('div', null, h('button', { class: 'btn deep', type: 'submit', text: 'Subscribe' })), subMsg);
    sub.addEventListener('submit', function (e) {
      e.preventDefault(); clear(subMsg);
      if (!validEmail(val(sub, 'subemail'))) { subMsg.appendChild(notice('Please enter a valid email address.')); return; }
      S.subs++; commit(); sub.reset();
      subMsg.appendChild(notice('Subscribed (demo). A real welcome email would be sent here.', true));
    });
    root.appendChild(h('div', { class: 'stack' },
      h('div', { class: 'tiles' },
        h('a', { class: 'tile', href: '#membership' }, h('div', { class: 'n', text: 'I' }), h('div', { class: 'l', text: 'Become a member' })),
        h('a', { class: 'tile', href: 'volunteer.html' }, h('div', { class: 'n', text: 'II' }), h('div', { class: 'l', text: 'Volunteer' })),
        h('a', { class: 'tile', href: 'register.html' }, h('div', { class: 'n', text: 'III' }), h('div', { class: 'l', text: 'Register for an event' })),
        h('a', { class: 'tile', href: 'donate.html' }, h('div', { class: 'n', text: 'IV' }), h('div', { class: 'l', text: 'Give' }))),
      h('div', { class: 'grid2' },
        h('div', { class: 'panel', id: 'membership' }, h('p', { class: 'tick', text: 'Membership' }), h('h2', { text: 'Join the Council' }),
          h('p', { text: 'Fill in the form. An administrator approves new applications. In this demo, payment is skipped.' }), form),
        h('div', { class: 'stack' },
          h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Newsletter' }), h('h2', { text: 'Stay in the loop' }),
            h('p', { text: 'News and invitations, a few times a year. Unsubscribe at any time.' }), sub),
          h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Already a member?' }), h('h2', { text: 'Sign in' }),
            h('p', { text: 'See your card, vote, and read member documents.' }), h('a', { class: 'btn deep', href: 'login.html', text: 'Member login' }))))));
  };

  R.volunteer = function (root) {
    var areas = ['Events and hospitality', 'Translation (Dari and English)', 'Youth and education', 'Archive and research', 'Website and social media', 'Fundraising'];
    var msg = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true },
      h('div', { class: 'frow' }, field('Full name', 'name', 'text', { ac: 'name' }), field('Email', 'email', 'email', { ac: 'email' })),
      h('div', null, h('p', { class: 'legend', text: 'Where can you help?' }), h('div', { class: 'opts' }, choice('area', 'checkbox', areas.map(function (a) { return { value: a, label: a }; })))),
      field('Availability', 'avail', 'select', { options: [{ value: 'Weekday evenings', label: 'Weekday evenings' }, { value: 'Weekends', label: 'Weekends' }, { value: 'A few hours a month', label: 'A few hours a month' }, { value: 'Flexible', label: 'Flexible' }] }),
      field('Anything we should know?', 'note', 'textarea'),
      h('div', null, h('button', { class: 'btn', type: 'submit', text: 'Offer to volunteer' })), msg);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(msg);
      if (!val(form, 'name') || !validEmail(val(form, 'email'))) { msg.appendChild(notice('Please enter your name and a valid email address.')); return; }
      var areasPicked = checkedVals(form, 'area');
      if (!areasPicked.length) { msg.appendChild(notice('Pick at least one area.')); return; }
      S.volunteers.push({ name: val(form, 'name'), email: val(form, 'email'), areas: areasPicked, avail: val(form, 'avail'), date: TODAY });
      commit(); form.reset();
      msg.appendChild(notice('Thank you. A coordinator would contact you within a week (demo: nothing was sent).', true));
    });
    root.appendChild(h('div', { class: 'panel narrow' }, form));
  };

  R.register = function (root) {
    var sel = param('event') || S.events[0].id;
    var evItems = S.events.map(function (ev) {
      var left = ev.cap - ev.reg;
      return { value: ev.id, label: ev.title, sub: fmt(ev.date) + ' · ' + (left > 0 ? left + ' places left' : 'Full') };
    });
    var out = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true },
      h('div', null, h('p', { class: 'legend', text: 'Choose an event' }), h('div', { class: 'optlist' }, choice('event', 'radio', evItems, [sel]))),
      h('div', { class: 'frow' }, field('Full name', 'name', 'text', { ac: 'name' }), field('Email', 'email', 'email', { ac: 'email' })),
      field('Number of people (including you)', 'guests', 'number', { value: '1', min: '1', max: '6' }),
      h('div', null, h('button', { class: 'btn', type: 'submit', text: 'Reserve places' })), out);
    var m = me();
    if (m) { form.elements.name.value = m.name; form.elements.email.value = m.email; }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(out);
      var id = checkedVals(form, 'event')[0];
      var ev = S.events.filter(function (x) { return x.id === id; })[0];
      var guests = parseInt(val(form, 'guests'), 10);
      if (!ev) { out.appendChild(notice('Choose an event.')); return; }
      if (!val(form, 'name') || !validEmail(val(form, 'email'))) { out.appendChild(notice('Please enter your name and a valid email address.')); return; }
      if (!(guests >= 1 && guests <= 6)) { out.appendChild(notice('Enter between 1 and 6 people.')); return; }
      if (ev.reg + guests > ev.cap) { out.appendChild(notice('Sorry, not enough places left for that event.')); return; }
      var code = 'REG-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      ev.reg += guests;
      S.regs.push({ event: ev.id, name: val(form, 'name'), email: val(form, 'email'), guests: guests, code: code });
      commit();
      clear(root);
      root.appendChild(h('div', { class: 'panel narrow center' }, h('p', { class: 'tick', text: 'You are registered' }), h('h2', { text: ev.title }),
        h('p', { text: fmt(ev.date) + ' · ' + ev.place }), h('p', { text: guests + (guests === 1 ? ' place' : ' places') + ' reserved for ' + val(form, 'name') + '.' }),
        h('p', { class: 'mission-lead', text: code }), h('p', { class: 'small', text: 'A confirmation email with this code would be sent (demo: nothing was sent).' }),
        h('a', { class: 'btn deep', href: 'register.html', text: 'Register for another event' })));
    });
    root.appendChild(h('div', { class: 'panel narrow' }, form));
  };

  var MEMBER_PW = 'member2026', ADMIN_EMAIL = 'admin@example.org', ADMIN_PW = 'admin2026';

  function credsBox(lines) {
    return h('div', { class: 'excerpt' }, h('p', { class: 'tick', text: 'Demo credentials' }), lines.map(function (l) { return h('p', { style: 'margin:0', text: l }); }),
      h('p', { class: 'small', style: 'margin:8px 0 0', text: 'Demo only. The real site uses individual accounts with emailed one-time codes or passwords.' }));
  }
  function signedInPanel(root, m) {
    root.appendChild(h('div', { class: 'panel narrow center' }, h('h2', { text: 'You are signed in' }), h('p', { text: m.name + ' (' + (S.role === 'admin' ? 'administrator' : 'member') + ')' }),
      h('div', { class: 'btns' }, h('a', { class: 'btn', href: S.role === 'admin' ? 'admin.html' : 'dashboard.html', text: 'Continue' }),
        h('button', { class: 'btn ghost', type: 'button', text: 'Sign out', onclick: function () { S.role = null; S.me = null; commit(); window.location.reload(); } }))));
  }

  R.login = function (root) {
    var m = me();
    if (S.role && m) { signedInPanel(root, m); return; }
    var msg = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true }, field('Email', 'email', 'email', { ac: 'username' }), field('Password', 'password', 'password', { ac: 'current-password' }),
      h('div', { class: 'btns', style: 'justify-content:flex-start' }, h('button', { class: 'btn', type: 'submit', text: 'Sign in' }),
        h('button', { class: 'btn ghost', type: 'button', text: 'Forgot password', onclick: function () {
          clear(msg);
          if (!validEmail(val(form, 'email'))) { msg.appendChild(notice('Enter your email above first.')); return; }
          msg.appendChild(notice('A reset link would be emailed to ' + val(form, 'email') + ' (demo: nothing was sent).', true));
        } })), msg);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(msg);
      var email = val(form, 'email').toLowerCase(), pw = form.elements.password.value;
      if (!email || !pw) { msg.appendChild(notice('Enter your email and password.')); return; }
      if (email === ADMIN_EMAIL) { msg.appendChild(notice('That is an administrator account. Use the administrator login.')); return; }
      var mem = S.members.filter(function (x) { return x.email.toLowerCase() === email; })[0];
      if (!mem || pw !== MEMBER_PW) { msg.appendChild(notice('Email or password not recognised.')); return; }
      S.role = 'member'; S.me = mem.id; commit(); window.location.href = 'dashboard.html';
    });
    root.appendChild(h('div', { class: 'grid2' },
      h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Members' }), h('h2', { text: 'Member login' }), form,
        h('p', { class: 'small', style: 'margin-top:14px' }, 'Not a member yet? ', h('a', { href: 'join.html', text: 'Join the Council' }), '.')),
      h('div', { class: 'stack' },
        credsBox(['Email: zahra.noori@example.org', 'Password: ' + MEMBER_PW, 'Any member email in the directory also works.']),
        h('button', { class: 'btn deep', type: 'button', text: 'Fill in the demo member', onclick: function () { form.elements.email.value = 'zahra.noori@example.org'; form.elements.password.value = MEMBER_PW; } }),
        h('p', { class: 'small', text: 'Council administrators sign in on their own page.' }), h('a', { class: 'link', href: 'admin-login.html', text: 'Administrator login' }))));
  };

  R.adminlogin = function (root) {
    var m = me();
    if (S.role === 'admin' && m) { signedInPanel(root, m); return; }
    var msg = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true }, field('Administrator email', 'email', 'email', { ac: 'username' }), field('Password', 'password', 'password', { ac: 'current-password' }),
      h('div', null, h('button', { class: 'btn deep', type: 'submit', text: 'Sign in to administration' })), msg);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(msg);
      if ((S.adminFails || 0) >= 5) { msg.appendChild(notice('Too many failed attempts. In the real site the account locks for 15 minutes. Use "Reset demo data" in the banner to try again.')); return; }
      var email = val(form, 'email').toLowerCase(), pw = form.elements.password.value;
      if (!email || !pw) { msg.appendChild(notice('Enter your email and password.')); return; }
      if (email !== ADMIN_EMAIL || pw !== ADMIN_PW) {
        S.adminFails = (S.adminFails || 0) + 1; commit();
        msg.appendChild(notice('Email or password not recognised. Attempt ' + S.adminFails + ' of 5.')); return;
      }
      S.adminFails = 0; S.role = 'admin'; S.me = 'ANCSH-0000'; commit(); window.location.href = 'admin.html';
    });
    root.appendChild(h('div', { class: 'grid2' },
      h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Council administrators' }), h('h2', { text: 'Administrator login' }), form),
      h('div', { class: 'stack' },
        credsBox(['Email: ' + ADMIN_EMAIL, 'Password: ' + ADMIN_PW]),
        h('button', { class: 'btn ghost', type: 'button', text: 'Fill in the demo administrator', onclick: function () { form.elements.email.value = ADMIN_EMAIL; form.elements.password.value = ADMIN_PW; } }),
        h('div', { class: 'panel' }, h('h3', { text: 'In the real site' }), h('p', { text: 'Administrator accounts need two-step verification, a short session time and a log of who changed what. At least two Council officers should hold admin access so no one person is a single point of failure.' })))));
  };

  R.dashboard = function (root) {
    if (!guard(root)) return;
    var m = me();
    var welcome = param('welcome');
    var myRegs = S.regs.filter(function (r) { return r.email.toLowerCase() === m.email.toLowerCase(); });
    var next = S.events[0];
    var msg = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true },
      h('div', { class: 'frow' }, field('Name', 'name', 'text', { value: m.name }), field('City and country', 'city', 'text', { value: m.city })),
      field('A line about you (shown in the directory)', 'bio', 'textarea'),
      h('label', { class: 'small' }, h('input', { type: 'checkbox', name: 'dir', checked: m.directory }), ' Show me in the member directory'),
      h('div', null, h('button', { class: 'btn deep', type: 'submit', text: 'Save profile' })), msg);
    form.elements.bio.value = m.bio;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(msg);
      if (!val(form, 'name')) { msg.appendChild(notice('Name cannot be empty.')); return; }
      m.name = val(form, 'name'); m.city = val(form, 'city'); m.bio = val(form, 'bio'); m.directory = form.elements.dir.checked; commit();
      msg.appendChild(notice('Profile saved.', true));
    });
    root.appendChild(h('div', { class: 'stack' },
      welcome ? notice(m.status === 'pending' ? 'Application received. An administrator will approve it, and then your card is ready.' : 'Welcome back.', true) : null,
      h('div', { class: 'tiles' },
        h('div', { class: 'tile' }, h('div', { class: 'n', text: m.id.replace('ANCSH-', '#') }), h('div', { class: 'l', text: 'Member number' })),
        h('div', { class: 'tile' }, h('div', { class: 'n' }, chipFor(m.status)), h('div', { class: 'l', text: 'Status' })),
        h('div', { class: 'tile' }, h('div', { class: 'n', text: m.expires ? fmt(m.expires).replace(/, \d+$/, '') : 'n/a' }), h('div', { class: 'l', text: 'Valid until ' + (m.expires ? m.expires.slice(0, 4) : '') })),
        h('div', { class: 'tile' }, h('div', { class: 'n', text: m.type }), h('div', { class: 'l', text: 'Membership type' }))),
      h('div', { class: 'grid2' },
        h('div', { class: 'stack' },
          h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Notices' }), h('h2', { text: 'From the Council' }),
            S.notices.map(function (n) { return h('p', null, h('span', { class: 'meta', text: fmt(n.d) + '  ' }), n.t); })),
          h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Next gathering' }), h('h2', { text: next.title }), h('p', { text: fmt(next.date) + ' · ' + next.place }),
            h('a', { class: 'btn', href: 'register.html?event=' + next.id, text: 'Register' }),
            myRegs.length ? h('p', { class: 'small', style: 'margin-top:12px', text: 'You have ' + myRegs.length + ' registration(s) in this demo.' }) : null),
          h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Quick links' }),
            h('div', { class: 'btns', style: 'justify-content:flex-start' },
              h('a', { class: 'btn ghost sm', href: 'card.html', text: 'My card' }), h('a', { class: 'btn ghost sm', href: 'vote.html', text: 'Vote' }),
              h('a', { class: 'btn ghost sm', href: 'documents.html', text: 'Documents' }), h('a', { class: 'btn ghost sm', href: 'renew.html', text: 'Renew' })))),
        h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'My profile' }), h('h2', { text: 'Edit your details' }), form))));
  };

  R.card = function (root) {
    if (!guard(root)) return;
    var m = me();
    var card = h('div', { class: 'mcard' },
      h('div', { class: 'top' }, h('img', { src: 'assets/img/logo.jpg', alt: '', width: 46, height: 46 }), h('div', { class: 'org', text: 'Afghanistan National Council of Sunni Hazaras' })),
      h('div', null, h('div', { class: 'sm', text: m.type + ' member' }), h('div', { class: 'nm', text: m.name })),
      h('div', { class: 'row' }, h('div', null, h('div', { class: 'sm', text: m.id }), h('div', { class: 'sm', text: m.status === 'active' ? 'Valid until ' + fmt(m.expires) : (m.status === 'pending' ? 'Pending approval' : 'Expired ' + fmt(m.expires)) })), qrSvg(m.id + m.name)));
    root.appendChild(h('div', { class: 'stack', style: 'justify-items:center' },
      card,
      m.status !== 'active' ? notice(m.status === 'pending' ? 'This card becomes valid once an administrator approves your application.' : 'This card has expired. Renew to reactivate it.') : null,
      h('p', { class: 'small center', text: 'The real card links the code to a verification page, so a Council volunteer can check a member at the door. A wallet pass for phones can be added later.' }),
      h('div', { class: 'btns' }, m.status === 'expired' ? h('a', { class: 'btn', href: 'renew.html', text: 'Renew now' }) : null, h('a', { class: 'btn ghost', href: 'dashboard.html', text: 'Back to dashboard' }))));
  };

  R.renew = function (root) {
    if (!guard(root)) return;
    var m = me();
    var price = { Individual: 25, Family: 40, Student: 10, Supporter: 100 }[m.type] || 25;
    var out = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack' },
      h('div', { class: 'optlist' }, choice('term', 'radio', [{ value: '1', label: '1 year', sub: money(price) + ' (sample price)' }, { value: '2', label: '2 years', sub: money(price * 2 - Math.round(price * 0.1)) + ' (sample, small discount)' }], ['1'])),
      h('div', null, h('button', { class: 'btn', type: 'submit', text: 'Renew (demo, no payment)' })), out);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(out);
      var yrs = parseInt(checkedVals(form, 'term')[0], 10);
      var base = m.expires && m.expires > TODAY ? m.expires : TODAY;
      m.expires = addYears(base, yrs); m.status = 'active';
      S.renewals.push({ id: m.id, date: TODAY, yrs: yrs }); commit();
      out.appendChild(notice('Renewed. Your membership is now valid until ' + fmt(m.expires) + '.', true));
      hist();
    });
    var histBox = h('div');
    function hist() {
      clear(histBox);
      var mine = S.renewals.filter(function (r) { return r.id === m.id; });
      add(histBox, mine.length ? mine.map(function (r) { return h('p', { text: fmt(r.date) + ': renewed for ' + r.yrs + ' year(s)' }); }) : h('p', { class: 'small', text: 'No renewals yet in this demo.' }));
    }
    hist();
    root.appendChild(h('div', { class: 'grid2' },
      h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Current membership' }), h('h2', { text: m.type }),
        h('p', null, chipFor(m.status), '  valid until ' + fmt(m.expires)), form),
      h('div', { class: 'panel' }, h('h2', { text: 'History' }), histBox,
        h('p', { class: 'small', text: 'The real site sends a reminder email 30 days before expiry and takes payment through Stripe.' }))));
  };

  R.committees = function (root) {
    if (!guard(root)) return;
    var cur = S.committees[0].id;
    var box = h('div');
    var tabs = h('div', { class: 'tabs', role: 'tablist' });
    function draw() {
      clear(tabs); clear(box);
      S.committees.forEach(function (c) {
        tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': c.id === cur ? 'true' : 'false', text: c.name, onclick: function () { cur = c.id; draw(); } }));
      });
      var c = S.committees.filter(function (x) { return x.id === cur; })[0];
      var people = S.members.filter(function (m) { return m.committee === c.name; });
      var taskBox = h('div', null, c.tasks.map(function (t, i) {
        var cb = h('input', { type: 'checkbox', id: 't' + i, 'aria-label': t.t });
        cb.checked = t.done;
        cb.addEventListener('change', function () { t.done = cb.checked; commit(); draw(); });
        return h('div', { class: 'cm-row' + (t.done ? ' done' : '') }, cb, h('span', { text: t.t }));
      }));
      var addForm = null;
      if (S.role === 'admin') {
        addForm = h('form', { class: 'frow', style: 'margin-top:14px' }, field('Add a task', 'nt', 'text'), h('div', { style: 'align-self:end' }, h('button', { class: 'btn sm', type: 'submit', text: 'Add' })));
        addForm.addEventListener('submit', function (e) { e.preventDefault(); var v = val(addForm, 'nt'); if (!v) return; c.tasks.push({ t: v, done: false }); commit(); draw(); });
      }
      box.appendChild(h('div', { class: 'grid2' },
        h('div', { class: 'panel' }, h('h2', { text: c.name }), h('p', { text: c.blurb }),
          h('p', null, h('b', { text: 'Chair: ' }), c.chair), h('p', null, h('b', { text: 'Meets: ' }), c.meets),
          h('p', null, h('b', { text: 'Next meeting: ' }), fmt(c.next)),
          h('p', { class: 'legend', text: 'Members (' + people.length + ')' }),
          h('div', { class: 'opts' }, people.length ? people.map(function (p) { return h('span', { class: 'chip', text: p.name }); }) : h('span', { class: 'small', text: 'No members assigned yet.' }))),
        h('div', { class: 'panel' }, h('h2', { text: 'Tasks' }), taskBox, addForm)));
    }
    draw();
    root.appendChild(h('div', null, tabs, box));
  };

  R.documents = function (root) {
    if (!guard(root)) return;
    var list = h('div', { class: 'stack' });
    var q = h('input', { type: 'search', id: 'dq', placeholder: 'Search documents', 'aria-label': 'Search documents' });
    var cat = h('select', { id: 'dc', 'aria-label': 'Category' }, h('option', { value: '', text: 'All categories' }),
      Object.keys(S.documents.reduce(function (a, d) { a[d.cat] = 1; return a; }, {})).map(function (c) { return h('option', { value: c, text: c }); }));
    function allowed(d) { return d.access === 'All members' || (d.access === 'Committees' && !!me().committee) || S.role === 'admin'; }
    function draw() {
      clear(list);
      var n = 0;
      S.documents.filter(function (d) {
        return (!cat.value || d.cat === cat.value) && (!q.value || d.title.toLowerCase().indexOf(q.value.toLowerCase()) !== -1);
      }).forEach(function (d) {
        n++;
        var ok = allowed(d), ex = h('div');
        list.appendChild(h('div', { class: 'panel' }, h('div', { class: 'lead-row' },
          h('div', null, h('h3', { text: d.title, style: 'font-size:22px;margin:0' }), h('span', { class: 'small', text: d.cat + ' · ' + fmt(d.date) + '  ' }), h('span', { class: 'chip' + (ok ? ' ok' : ' bad'), text: ok ? d.access : d.access + ' only' })),
          h('button', { class: 'btn sm ' + (ok ? 'deep' : 'ghost'), type: 'button', disabled: !ok, text: ok ? 'Preview' : 'Locked', onclick: function () {
            if (ex.firstChild) { clear(ex); return; }
            ex.appendChild(h('div', { class: 'excerpt' }, d.ex, h('p', { class: 'small', style: 'margin:8px 0 0', text: 'Demo preview. The real site opens the PDF here.' })));
          } })), ex));
      });
      if (!n) list.appendChild(h('p', { class: 'center', text: 'No documents match.' }));
    }
    q.addEventListener('input', draw); cat.addEventListener('change', draw); draw();
    root.appendChild(h('div', { class: 'stack' }, h('div', { class: 'frow' }, h('div', { class: 'fld' }, q), h('div', { class: 'fld' }, cat)),
      h('p', { class: 'small', text: 'Access follows your role: all members, committee members, or the Board (administrators in this demo).' }), list));
  };

  R.vote = function (root) {
    if (!guard(root)) return;
    var m = me(), B = S.ballot;
    if (m.status !== 'active') { root.appendChild(h('div', { class: 'panel narrow center' }, h('h2', { text: 'Voting is for active members' }), h('p', { text: 'Your membership is ' + m.status + '. Renew or wait for approval to vote.' }), h('a', { class: 'btn', href: 'renew.html', text: 'Renew' }))); return; }
    if (B.voted[m.id]) {
      root.appendChild(h('div', { class: 'panel narrow center' }, h('p', { class: 'tick', text: 'Ballot recorded' }), h('h2', { text: 'Thank you for voting' }),
        h('p', { text: 'Your ballot was recorded on the demo ballot. Results are shown to administrators after voting closes on ' + fmt(B.closes) + '.' }),
        h('a', { class: 'btn ghost', href: 'dashboard.html', text: 'Back to dashboard' })));
      return;
    }
    var out = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true }, B.items.map(function (it) {
      return h('div', { class: 'panel' }, h('p', { class: 'tick', text: it.type === 'multi' ? 'Choose up to ' + it.max : 'Choose one' }), h('h3', { text: it.q }),
        h('div', { class: 'optlist' }, choice(it.id, it.type === 'multi' ? 'checkbox' : 'radio', it.opts.map(function (o) { return { value: o, label: o }; }))));
    }), out, h('div', null, h('button', { class: 'btn', type: 'submit', text: 'Review my ballot' })));
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(out);
      var picks = {};
      for (var i = 0; i < B.items.length; i++) {
        var it = B.items[i], v = checkedVals(form, it.id);
        if (it.type === 'multi' && v.length > it.max) { out.appendChild(notice('Choose no more than ' + it.max + ' for: ' + it.q)); return; }
        if (!v.length) { out.appendChild(notice('Please answer: ' + it.q + ' (you can pick Abstain on motions).')); return; }
        picks[it.id] = v;
      }
      clear(root);
      root.appendChild(h('div', { class: 'panel narrow' }, h('p', { class: 'tick', text: 'Review' }), h('h2', { text: 'Check your ballot' }),
        B.items.map(function (it) { return h('p', null, h('b', { text: it.q + ': ' }), picks[it.id].join(', ')); }),
        h('p', { class: 'small', text: 'Once cast, a ballot cannot be changed.' }),
        h('div', { class: 'btns' },
          h('button', { class: 'btn', type: 'button', text: 'Cast ballot', onclick: function () {
            B.items.forEach(function (it) { picks[it.id].forEach(function (o) { B.tally[it.id][o] = (B.tally[it.id][o] || 0) + 1; }); });
            B.voted[m.id] = true; B.voters++; commit(); window.location.reload();
          } }),
          h('a', { class: 'btn ghost', href: 'vote.html', text: 'Go back' }))));
    });
    root.appendChild(h('div', { class: 'stack' }, h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Open until ' + fmt(B.closes) }), h('h2', { text: B.title }),
      h('p', { text: 'One ballot per active member. Candidates and motions here are samples.' }),
      h('p', { class: 'small', text: 'Before the real vote: confirm with the Council\'s bylaws and a lawyer how members are verified, how secrecy is kept and how results are audited.' })), form));
  };

  R.directory = function (root) {
    if (!guard(root)) return;
    var q = h('input', { type: 'search', placeholder: 'Search by name or city', 'aria-label': 'Search members' });
    var grid = h('div', { class: 'dir' }), detail = h('div');
    function draw() {
      clear(grid);
      S.members.filter(function (m) {
        return m.directory && m.status === 'active' && (m.name + ' ' + m.city).toLowerCase().indexOf(q.value.toLowerCase()) !== -1;
      }).forEach(function (m) {
        grid.appendChild(h('button', { class: 'mem', type: 'button', style: 'font:inherit;cursor:pointer;color:inherit', 'aria-label': 'View profile of ' + m.name, onclick: function () {
          clear(detail);
          detail.appendChild(h('div', { class: 'panel', style: 'margin-bottom:18px' }, h('div', { class: 'avatar', text: m.name.charAt(0) }), h('h2', { text: m.name }),
            h('p', { text: m.city + ' · ' + m.type + ' member since ' + m.joined.slice(0, 4) }), m.committee ? h('p', null, h('span', { class: 'chip', text: m.committee })) : null,
            h('p', { text: m.bio || 'No bio yet.' }), h('p', { class: 'small', text: 'Members choose what to share. Email addresses are never shown.' })));
          detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } }, h('div', { class: 'avatar', text: m.name.charAt(0) }), h('h3', { text: m.name }), h('p', { text: m.city }), m.committee ? h('p', { text: m.committee }) : null));
      });
      if (!grid.firstChild) grid.appendChild(h('p', { text: 'No members match.' }));
    }
    q.addEventListener('input', draw); draw();
    root.appendChild(h('div', { class: 'stack' }, h('div', { class: 'fld' }, q), detail, grid));
  };

  R.campaigns = function (root) {
    var list = h('div', { class: 'stack' });
    function draw() {
      clear(list);
      S.campaigns.forEach(function (c) {
        var pct = Math.min(100, Math.round(c.raised / c.goal * 100));
        list.appendChild(h('div', { class: 'panel' }, h('div', { class: 'lead-row' }, h('h3', { text: c.title }), h('span', { class: 'chip', text: 'Ends ' + fmt(c.ends) })),
          h('p', { text: c.desc }), h('div', { class: 'bar', role: 'img', 'aria-label': pct + ' percent of goal' }, h('i', { style: 'width:' + pct + '%' })),
          h('p', { class: 'small', style: 'margin:8px 0 14px', text: money(c.raised) + ' raised of ' + money(c.goal) + ' (' + pct + '%)' }),
          h('a', { class: 'btn sm', href: 'donate.html?campaign=' + c.id, text: 'Give to this campaign' })));
      });
    }
    draw();
    var parts = [list];
    if (S.role === 'admin') {
      var form = h('form', { class: 'panel stack', novalidate: true }, h('h3', { text: 'New campaign (administrators)' }),
        h('div', { class: 'frow' }, field('Title', 'title', 'text'), field('Goal (USD)', 'goal', 'number', { min: '100' }), field('End date', 'ends', 'date')),
        field('Short description', 'desc', 'textarea'), h('div', null, h('button', { class: 'btn deep', type: 'submit', text: 'Create campaign' })));
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var g = parseInt(val(form, 'goal'), 10);
        if (!val(form, 'title') || !(g >= 100)) return;
        S.campaigns.push({ id: 'c' + (S.campaigns.length + 1), title: val(form, 'title'), goal: g, raised: 0, ends: val(form, 'ends') || '2027-06-30', desc: val(form, 'desc') });
        commit(); form.reset(); draw();
      });
      parts.push(form);
    } else {
      parts.push(h('p', { class: 'small center', text: 'Administrators can create and close campaigns.' }));
    }
    root.appendChild(h('div', { class: 'stack' }, parts));
  };

  R.archive = function (root) {
    var q = h('input', { type: 'search', placeholder: 'Search the archive', 'aria-label': 'Search the archive' });
    var typ = h('select', { 'aria-label': 'Type' }, ['', 'Event', 'Document', 'Photo', 'Recording'].map(function (t) { return h('option', { value: t, text: t || 'All types' }); }));
    var list = h('div', { class: 'list' });
    function draw() {
      clear(list);
      S.archive.filter(function (a) { return (!typ.value || a.t === typ.value) && (a.n + ' ' + a.d).toLowerCase().indexOf(q.value.toLowerCase()) !== -1; })
        .sort(function (a, b) { return b.y - a.y; })
        .forEach(function (a) { list.appendChild(h('div', { class: 'item' }, h('div', { class: 'meta', text: a.y + ' · ' + a.t }), h('h3', { text: a.n }), h('p', { text: a.d }))); });
      if (!list.firstChild) list.appendChild(h('p', { class: 'center', text: 'Nothing found.' }));
    }
    q.addEventListener('input', draw); typ.addEventListener('change', draw); draw();
    root.appendChild(h('div', { class: 'stack' }, h('div', { class: 'frow' }, h('div', { class: 'fld' }, q), h('div', { class: 'fld' }, typ)),
      h('p', { class: 'small', text: 'Sample entries. The real archive holds scanned documents, photo sets and recordings the Council chooses to publish.' }), list));
  };

  R.admin = function (root) {
    if (!guard(root, true)) return;
    var q = h('input', { type: 'search', placeholder: 'Search name, email or city', 'aria-label': 'Search members' });
    var st = h('select', { 'aria-label': 'Status' }, ['', 'active', 'pending', 'expired'].map(function (t) { return h('option', { value: t, text: t || 'Any status' }); }));
    var ty = h('select', { 'aria-label': 'Type' }, ['', 'Individual', 'Family', 'Student', 'Supporter'].map(function (t) { return h('option', { value: t, text: t || 'Any type' }); }));
    var tiles = h('div', { class: 'tiles' }), body = h('tbody'), msg = h('div', { 'aria-live': 'polite' });
    function draw() {
      clear(tiles); clear(body);
      ['active', 'pending', 'expired'].forEach(function (s) {
        tiles.appendChild(h('div', { class: 'tile' }, h('div', { class: 'n', text: String(S.members.filter(function (m) { return m.status === s; }).length) }), h('div', { class: 'l', text: s })));
      });
      tiles.appendChild(h('div', { class: 'tile' }, h('div', { class: 'n', text: String(S.members.length) }), h('div', { class: 'l', text: 'total records' })));
      S.members.filter(function (m) {
        return (!st.value || m.status === st.value) && (!ty.value || m.type === ty.value) && (m.name + ' ' + m.email + ' ' + m.city).toLowerCase().indexOf(q.value.toLowerCase()) !== -1;
      }).forEach(function (m) {
        var act = null;
        if (m.status === 'pending') act = h('button', { class: 'btn sm', type: 'button', text: 'Approve', onclick: function () { m.status = 'active'; m.expires = addYears(TODAY, 1); commit(); clear(msg); msg.appendChild(notice(m.name + ' approved. A welcome email with the card link would be sent.', true)); draw(); } });
        else if (m.status === 'expired') act = h('button', { class: 'btn sm ghost', type: 'button', text: 'Remind', onclick: function () { clear(msg); msg.appendChild(notice('Renewal reminder would be emailed to ' + m.email + ' (demo: nothing sent).', true)); } });
        body.appendChild(h('tr', null, h('td', { text: m.id }), h('td', { text: m.name }), h('td', { text: m.email }), h('td', { text: m.city }), h('td', { text: m.type }), h('td', null, chipFor(m.status)), h('td', { text: m.expires ? fmt(m.expires) : 'n/a' }), h('td', null, act)));
      });
    }
    function csv() {
      var rows = [['id', 'name', 'email', 'city', 'type', 'status', 'expires']].concat(S.members.map(function (m) { return [m.id, m.name, m.email, m.city, m.type, m.status, m.expires]; }));
      return rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    }
    var copyBtn = h('button', { class: 'btn ghost sm', type: 'button', text: 'Copy all as CSV', onclick: function () {
      var t = csv();
      function fallback() { clear(msg); msg.appendChild(h('textarea', { 'aria-label': 'CSV', style: 'width:100%;min-height:120px', readonly: true }, t)); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { clear(msg); msg.appendChild(notice('Copied ' + S.members.length + ' rows to the clipboard.', true)); }, fallback);
      else fallback();
    } });
    q.addEventListener('input', draw); st.addEventListener('change', draw); ty.addEventListener('change', draw);
    draw();
    root.appendChild(h('div', { class: 'stack' }, tiles,
      h('div', { class: 'frow' }, h('div', { class: 'fld' }, q), h('div', { class: 'fld' }, st), h('div', { class: 'fld' }, ty)),
      h('div', null, copyBtn), msg,
      h('div', { class: 'tbl-wrap', tabindex: '0', role: 'region', 'aria-label': 'Member table' }, h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, ['ID', 'Name', 'Email', 'City', 'Type', 'Status', 'Expires', ''].map(function (c) { return h('th', { text: c }); }))), body)),
      h('p', { class: 'small', text: 'The real database adds edit, notes, groups, bulk email and an audit log of who changed what.' })));
  };

  R.reports = function (root) {
    if (!guard(root, true)) return;
    var active = S.members.filter(function (m) { return m.status === 'active'; }).length;
    var giftTotal = S.giving.reduce(function (a, b) { return a + b; }, 0);
    var regCount = S.events.reduce(function (a, e) { return a + e.reg; }, 0);
    var byCity = {}, byType = {}, byMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    S.members.forEach(function (m) {
      if (m.id === 'ANCSH-0000') return;
      byCity[m.city] = (byCity[m.city] || 0) + 1; byType[m.type] = (byType[m.type] || 0) + 1;
      if (m.joined.slice(0, 4) === '2026') byMonth[+m.joined.slice(5, 7) - 1]++;
    });
    function rows(o) { return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; }); }
    var tile = function (n, l) { return h('div', { class: 'tile' }, h('div', { class: 'n', text: String(n) }), h('div', { class: 'l', text: l })); };
    var B = S.ballot;
    root.appendChild(h('div', { class: 'stack' },
      h('div', { class: 'tiles' }, tile(S.members.length - 1, 'Members on record'), tile(active, 'Active'), tile(money(giftTotal), 'Given in 6 months'), tile(regCount, 'Event places reserved'), tile(S.volunteers.length, 'Volunteers'), tile(S.subs, 'Newsletter readers')),
      h('div', { class: 'grid2' },
        h('div', { class: 'panel' }, h('h3', { text: 'New members by month, 2026' }), vbars(MONTHS, byMonth)),
        h('div', { class: 'panel' }, h('h3', { text: 'Giving by month' }), vbars(['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], S.giving, money))),
      h('div', { class: 'grid2' },
        h('div', { class: 'panel' }, h('h3', { text: 'Members by city' }), hbars(rows(byCity))),
        h('div', { class: 'panel' }, h('h3', { text: 'Members by type' }), hbars(rows(byType)))),
      h('div', { class: 'grid2' },
        h('div', { class: 'panel' }, h('h3', { text: 'Event registrations' }), hbars(S.events.map(function (e) { return [e.title, e.reg, e.reg + ' / ' + e.cap]; }), 300)),
        h('div', { class: 'panel' }, h('h3', { text: 'Election turnout (sample)' }), hbars([['Ballots cast', B.voters, B.voters], ['Active members', active, active]]),
          h('p', { class: 'small', style: 'margin-top:12px', text: 'Motion 1 so far: Yes ' + B.tally.b2.Yes + ', No ' + B.tally.b2.No + ', Abstain ' + B.tally.b2.Abstain + '. Shown to administrators only.' }))),
      h('p', { class: 'small', text: 'Figures mix sample data with anything you did in this demo. Real reports are exportable and respect member privacy.' })));
  };

  function table(cols, rows) {
    return h('div', { class: 'tbl-wrap', tabindex: '0', role: 'region', 'aria-label': 'Table' }, h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, cols.map(function (c) { return h('th', { text: c }); }))), h('tbody', null, rows)));
  }

  R.inbox = function (root) {
    if (!guard(root, true)) return;
    var cur = 'Messages', box = h('div'), tabs = h('div', { class: 'tabs', role: 'tablist' });
    function draw() {
      clear(tabs); clear(box);
      ['Messages', 'Volunteers', 'Registrations'].forEach(function (t) {
        var n = t === 'Messages' ? S.messages.filter(function (m) { return !m.done; }).length : (t === 'Volunteers' ? S.volunteers.length : S.regs.length);
        tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': t === cur ? 'true' : 'false', text: t + ' (' + n + ')', onclick: function () { cur = t; draw(); } }));
      });
      if (cur === 'Messages') {
        if (!S.messages.length) box.appendChild(h('p', { class: 'center', text: 'No messages yet.' }));
        S.messages.slice().reverse().forEach(function (m) {
          box.appendChild(h('div', { class: 'panel', style: 'margin-bottom:14px' }, h('div', { class: 'lead-row' }, h('div', null, h('b', { text: m.name }), '  ', h('span', { class: 'small', text: m.email + ' · ' + fmt(m.date) })),
            h('button', { class: 'btn sm ' + (m.done ? 'ghost' : 'deep'), type: 'button', text: m.done ? 'Mark as open' : 'Mark as handled', onclick: function () { m.done = !m.done; commit(); draw(); } })),
            h('p', { style: 'margin:10px 0 0', text: m.text }), h('p', { style: 'margin:6px 0 0' }, h('span', { class: 'chip ' + (m.done ? 'ok' : 'warn'), text: m.done ? 'handled' : 'open' }))));
        });
      } else if (cur === 'Volunteers') {
        box.appendChild(table(['Name', 'Email', 'Areas', 'Availability', 'Date'], S.volunteers.map(function (v) {
          return h('tr', null, h('td', { text: v.name }), h('td', { text: v.email }), h('td', { text: v.areas.join(', ') }), h('td', { text: v.avail }), h('td', { text: fmt(v.date) }));
        })));
      } else {
        box.appendChild(table(['Code', 'Event', 'Name', 'Email', 'People'], S.regs.map(function (r) {
          var ev = S.events.filter(function (e) { return e.id === r.event; })[0];
          return h('tr', null, h('td', { text: r.code }), h('td', { text: ev ? ev.title : r.event }), h('td', { text: r.name }), h('td', { text: r.email }), h('td', { text: String(r.guests) }));
        })));
      }
    }
    draw();
    root.appendChild(h('div', null, tabs, box));
  };

  function campName(id) { var c = S.campaigns.filter(function (x) { return x.id === id; })[0]; return c ? c.title : 'General fund'; }
  var METHODS = { card: 'Card or wallet', us_bank_account: 'US bank account' };

  R.donations = function (root) {
    if (!guard(root, true)) return;
    var total = S.donations.reduce(function (a, d) { return a + d.amt; }, 0);
    var monthly = S.donations.filter(function (d) { return d.freq === 'monthly'; });
    var tile = function (n, l) { return h('div', { class: 'tile' }, h('div', { class: 'n', text: String(n) }), h('div', { class: 'l', text: l })); };
    root.appendChild(h('div', { class: 'stack' },
      h('div', { class: 'tiles' }, tile(money(total), 'Gifts listed'), tile(S.donations.length, 'Gifts'), tile(monthly.length, 'Monthly donors'), tile(money(monthly.reduce(function (a, d) { return a + d.amt; }, 0)), 'Monthly total')),
      table(['Date', 'Donor', 'Campaign', 'Amount', 'Frequency', 'Method'], S.donations.slice().sort(function (a, b) { return a.d < b.d ? 1 : -1; }).map(function (d) {
        return h('tr', null, h('td', { text: fmt(d.d) }), h('td', { text: d.name }), h('td', { text: campName(d.camp) }), h('td', { text: money(d.amt) }), h('td', { text: d.freq === 'monthly' ? 'Monthly' : 'One time' }), h('td', { text: METHODS[d.method] || d.method }));
      })),
      h('p', { class: 'small', text: 'In the real site the Stripe Dashboard is the record of every payment, refund and payout. This list is a convenience copy.' })));
  };

  /* hooks used by other scripts (donate.js, site.js) */
  window.ANCSH_DEMO = {
    campaigns: function () { return S.campaigns.map(function (c) { return { id: c.id, title: c.title }; }); },
    recordDonation: function (g) {
      var c = S.campaigns.filter(function (x) { return x.id === g.camp; })[0];
      if (c) c.raised += Math.round(g.amt);
      S.giving[S.giving.length - 1] += Math.round(g.amt);
      S.donations.push({ d: TODAY, name: g.name || 'Anonymous', amt: Math.round(g.amt), freq: g.freq, camp: g.camp, method: g.method });
      commit();
    },
    saveContact: function (m) { S.messages.push({ name: m.name, email: m.email, text: m.text, date: TODAY, done: false }); commit(); }
  };

  /* ---------- shell: who am I, subnav, reset ---------- */
  function shell() {
    var who = document.getElementById('whoami');
    if (who) {
      var m = me();
      if (S.role && m) {
        who.appendChild(h('span', { text: m.name + ' · ' + S.role }));
        who.appendChild(h('button', { type: 'button', text: 'Sign out', onclick: function () { S.role = null; S.me = null; commit(); window.location.href = 'login.html'; } }));
      } else {
        who.appendChild(h('a', { href: 'login.html', text: 'Sign in' }));
      }
    }
    var file = window.location.pathname.split('/').pop() || 'index.html';
    Array.prototype.forEach.call(document.querySelectorAll('.subnav a'), function (a) {
      if (a.getAttribute('href') === file) a.setAttribute('aria-current', 'page');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.subnav [data-admin]'), function (a) { if (S.role !== 'admin') a.hidden = true; });
    var reset = document.getElementById('demo-reset');
    if (reset) reset.addEventListener('click', function () {
      try { window.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      mem = null; window.location.href = document.querySelector('.masthead a').getAttribute('href');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('[data-demo]');
    if (root && R[root.getAttribute('data-demo')]) {
      clear(root);
      R[root.getAttribute('data-demo')](root);
    }
    shell();
  });
})();
