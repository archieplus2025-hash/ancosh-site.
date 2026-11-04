/* Donate page. Real mode: asks the server function for a Stripe Checkout address and sends the donor there.
   The website never sees card or bank details; Stripe's own page collects them.
   Demo mode (no endpoint set): a simulated checkout, nothing is charged. */
(function () {
  'use strict';
  var cfg = window.ANCSH_CONFIG || {};
  var root, demo;

  function h(tag, attrs) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
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
  function add(p, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(p, x); });
    else p.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function money(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function validEmail(s) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s); }
  function note(text, ok) { return h('p', { class: 'notice' + (ok ? ' ok' : ''), role: 'status', text: text }); }
  function val(f, n) { return f.elements[n] ? (f.elements[n].value || '').trim() : ''; }
  function checked(f, n) { var r = f.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  function opts(name, kind, items, sel, onchange) {
    return items.map(function (it) {
      var i = h('input', { type: kind, name: name, value: it.value });
      if (it.value === sel) i.checked = true;
      if (onchange) i.addEventListener('change', onchange);
      return h('label', { class: 'opt' }, i, h('span', null, it.label, it.sub ? h('small', { text: it.sub }) : null));
    });
  }
  function fld(label, id, type, extra) {
    var attrs = { id: id, name: id, type: type };
    Object.keys(extra || {}).forEach(function (k) { attrs[k] = extra[k]; });
    return h('div', { class: 'fld' }, h('label', { for: id, text: label }), h('input', attrs));
  }
  function qs(n) { return new URLSearchParams(window.location.search).get(n); }

  function campaigns() {
    var list = demo ? demo.campaigns() : (cfg.campaigns || []);
    return [{ id: 'general', title: 'Where it is needed most' }].concat(list);
  }

  function thanks(text) {
    clear(root);
    root.appendChild(h('div', { class: 'panel narrow center' }, h('p', { class: 'tick', text: 'Thank you' }), h('h2', { text: 'Your gift is received' }),
      note(text, true), h('div', { class: 'btns' }, h('a', { class: 'btn deep', href: 'campaigns.html', text: 'See the campaigns' }), h('a', { class: 'btn ghost', href: 'index.html', text: 'Back to home' }))));
  }

  function simulatedCheckout(p) {
    clear(root);
    var where = campaigns().filter(function (c) { return c.id === p.campaign; })[0];
    root.appendChild(h('div', { class: 'panel narrow' },
      h('p', { class: 'tick', text: 'Stripe Checkout (simulation)' }),
      h('h2', { text: money(p.total) + (p.frequency === 'monthly' ? ' every month' : '') }),
      h('p', { text: 'Gift to: ' + (where ? where.title : 'General fund') }),
      h('p', { text: 'Pay with: ' + (p.method === 'us_bank_account' ? 'US bank account (ACH)' : 'Card, Apple Pay or Google Pay') }),
      p.coverFees ? h('p', { class: 'small', text: 'Includes ' + money(p.total - p.amount) + ' to cover processing fees.' }) : null,
      h('p', { class: 'small', text: 'The real button sends you to a page hosted by Stripe, where the card or bank details are entered. This site never sees them. With Stripe test keys the test card is 4242 4242 4242 4242.' }),
      h('div', { class: 'btns', style: 'justify-content:flex-start' },
        h('button', { class: 'btn', type: 'button', text: 'Pay ' + money(p.total) + ' (demo, no money moves)', onclick: function () {
          demo.recordDonation({ name: p.name, email: p.email, amt: p.amount, freq: p.frequency, camp: p.campaign, method: p.method });
          thanks('Thank you, ' + p.name + '. A receipt would be emailed to ' + p.email + '. Demo only: no payment was made.');
        } }),
        h('button', { class: 'btn ghost', type: 'button', text: 'Cancel', onclick: function () { render(note('Checkout cancelled. Nothing was charged.')); } }))));
  }

  function startCheckout(p, out) {
    if (cfg.checkoutEndpoint) {
      out.appendChild(note('Opening secure checkout...'));
      fetch(cfg.checkoutEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.url) throw new Error(j.error || 'failed'); return j; }); })
        .then(function (j) { window.location.href = j.url; })
        .catch(function () { clear(out); out.appendChild(note('We could not start checkout. Nothing was charged. Please try again or contact us.')); });
    } else if (demo) {
      simulatedCheckout(p);
    }
  }

  function render(banner) {
    clear(root);
    if (!cfg.checkoutEndpoint && !demo) {
      root.appendChild(h('div', { class: 'panel narrow center' }, h('h2', { text: 'Online giving opens soon' }),
        h('p', { text: 'The Council is finishing its payment account. To give in the meantime, please get in touch.' }), h('a', { class: 'btn', href: 'contact.html', text: 'Contact the Council' })));
      return;
    }
    var other = h('div', { class: 'fld' }, h('label', { for: 'other', text: 'Other amount (USD)' }), h('input', { id: 'other', name: 'other', type: 'number', min: '1', max: '10000', step: '1', placeholder: 'Enter an amount' }));
    other.hidden = true;
    var out = h('div', { 'aria-live': 'polite' });
    var form = h('form', { class: 'stack', novalidate: true },
      h('div', { class: 'fld' }, h('label', { for: 'camp', text: 'Give to' }),
        h('select', { id: 'camp', name: 'camp' }, campaigns().map(function (c) { return h('option', { value: c.id, text: c.title }); }))),
      h('div', null, h('p', { class: 'legend', text: 'How often' }), h('div', { class: 'opts' }, opts('freq', 'radio', [{ value: 'once', label: 'One time' }, { value: 'monthly', label: 'Monthly' }], 'once'))),
      h('div', null, h('p', { class: 'legend', text: 'Amount' }), h('div', { class: 'opts' },
        opts('amt', 'radio', [{ value: '25', label: '$25' }, { value: '50', label: '$50' }, { value: '100', label: '$100' }, { value: '250', label: '$250' }, { value: 'other', label: 'Other' }], '50', function () { other.hidden = checked(form, 'amt') !== 'other'; }))),
      other,
      h('div', null, h('p', { class: 'legend', text: 'Pay with' }), h('div', { class: 'optlist' },
        opts('method', 'radio', [{ value: 'card', label: 'Card, Apple Pay or Google Pay', sub: 'Fastest' }, { value: 'us_bank_account', label: 'US bank account (ACH)', sub: 'Paid straight from your bank' }], 'card'))),
      h('label', { class: 'small' }, h('input', { type: 'checkbox', name: 'fees' }), ' Add 3% to help cover processing fees (optional)'),
      h('div', { class: 'frow' }, fld('Name', 'name', 'text', { autocomplete: 'name' }), fld('Email for your receipt', 'email', 'email', { autocomplete: 'email' })),
      h('div', null, h('button', { class: 'btn', type: 'submit', text: 'Continue to secure checkout' })), out);
    var pre = qs('campaign');
    if (pre && form.elements.camp.querySelector('option[value="' + pre.replace(/[^a-z0-9_-]/gi, '') + '"]')) form.elements.camp.value = pre;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear(out);
      var a = checked(form, 'amt');
      var amount = a === 'other' ? parseFloat(val(form, 'other')) : parseInt(a, 10);
      if (!(amount >= 1 && amount <= 10000)) { out.appendChild(note('Enter an amount between $1 and $10,000.')); return; }
      if (!val(form, 'name') || !validEmail(val(form, 'email'))) { out.appendChild(note('Please enter your name and a valid email address.')); return; }
      var fees = form.elements.fees.checked;
      var p = { amount: amount, total: fees ? Math.round(amount * 103) / 100 : amount, coverFees: fees, frequency: checked(form, 'freq') || 'once',
        method: checked(form, 'method') || 'card', campaign: val(form, 'camp'), name: val(form, 'name'), email: val(form, 'email') };
      startCheckout(p, out);
    });
    root.appendChild(h('div', { class: 'grid2' },
      h('div', { class: 'panel' }, banner || null, form),
      h('div', { class: 'stack' },
        h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Secure by design' }), h('h2', { text: 'How giving works' }),
          h('p', { text: 'Payments are handled by Stripe. Your card or bank details go to Stripe, never to this website. You receive an emailed receipt.' }),
          h('p', { text: 'Monthly gifts can be cancelled at any time by writing to the Council.' })),
        h('div', { class: 'panel' }, h('p', { class: 'tick', text: 'Please note' }),
          h('p', { class: 'small', text: 'Gifts are not tax-deductible unless the Council tells you in writing that it holds tax-exempt status. Ask the Council if you need a receipt for your records.' })))));
  }

  document.addEventListener('DOMContentLoaded', function () {
    root = document.querySelector('[data-donate]');
    if (!root) return;
    demo = !cfg.checkoutEndpoint && window.ANCSH_DEMO ? window.ANCSH_DEMO : null;
    var status = qs('status');
    if (status === 'success') { thanks('Thank you. Stripe will email your receipt shortly.'); return; }
    render(status === 'cancel' ? note('Checkout cancelled. Nothing was charged.') : null);
  });
})();
