import { LOCALE, CURRENCY, LOW_STOCK_THRESHOLD } from './config.js';

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, value);
  }
  node.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H6"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2"/><circle cx="16.5" cy="14.5" r="1"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
  in: '<path d="M12 4v12"/><path d="M6 11l6 6 6-6"/><path d="M5 21h14"/>',
  out: '<path d="M12 20V8"/><path d="M6 13l6-6 6 6"/><path d="M5 3h14"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.3c2.2.6 3.5 2.5 3.5 5.7"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
};

export function icon(name, size = 18) {
  const span = document.createElement('span');
  span.className = 'icon';
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ''}</svg>`;
  return span;
}
const moneyFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const formatMoney = (value) => moneyFormat.format(Number(value) || 0);

export function toast(message, type = 'info') {
  const node = h('div', { class: `toast toast-${type}` }, message);
  document.getElementById('toasts').append(node);
  setTimeout(() => node.remove(), type === 'error' ? 6000 : 3500);
}

export function modal({ title, body, confirmLabel = 'Guardar', danger = false, wide = false, onConfirm }) {
  const dialog = h('dialog', { class: wide ? 'modal wide' : 'modal' });
  const errorBox = h('p', { class: 'form-error', role: 'alert', hidden: true });

  const closeBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Cerrar', onclick: () => dialog.close() }, icon('x'));
  const cancelBtn = h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => dialog.close() }, onConfirm ? 'Cancelar' : 'Cerrar');
  const confirmBtn = onConfirm
    ? h('button', { class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, type: 'submit' }, confirmLabel)
    : null;

  const form = h('form', { class: 'modal-form' },
    h('header', { class: 'modal-head' }, h('h2', {}, title), closeBtn),
    h('div', { class: 'modal-body' }, body, errorBox),
    h('footer', { class: 'modal-foot' }, cancelBtn, confirmBtn),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!onConfirm || !form.reportValidity()) return;
    errorBox.hidden = true;
    confirmBtn.disabled = true;
    try {
      await onConfirm();
      dialog.close();
    } catch (err) {
      errorBox.textContent = err.message || 'Ocurrió un error inesperado.';
      errorBox.hidden = false;
      confirmBtn.disabled = false;
    }
  });

  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());

  dialog.append(form);
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}

export function pageHeader(title, subtitle, ...actions) {
  return h('div', { class: 'page-header' },
    h('div', {},
      h('h1', { class: 'page-title' }, title),
      subtitle ? h('p', { class: 'page-sub' }, subtitle) : null,
    ),
    actions.length ? h('div', { class: 'page-actions' }, ...actions) : null,
  );
}

export function field(label, input, hint) {
  return h('label', { class: 'field' },
    h('span', { class: 'field-label' }, label),
    input,
    hint ? h('span', { class: 'field-hint' }, hint) : null,
  );
}

export function loadingState(text = 'Cargando...') {
  return h('div', { class: 'state', role: 'status' }, h('p', { class: 'state-text' }, text));
}

export function emptyState({ title, text, action }) {
  return h('div', { class: 'state' },
    h('p', { class: 'state-title' }, title),
    text ? h('p', { class: 'state-text' }, text) : null,
    action ?? null,
  );
}

export function errorState(err, retry) {
  return h('div', { class: 'state error', role: 'alert' },
    h('p', { class: 'state-title' }, 'No se pudo cargar la información'),
    h('p', { class: 'state-text' }, err?.message || 'Ocurrió un error inesperado.'),
    retry ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: retry }, 'Reintentar') : null,
  );
}

export function stockBadge(quantity) {
  if (quantity <= 0) return h('span', { class: 'badge badge-danger' }, 'Agotado');
  if (quantity <= LOW_STOCK_THRESHOLD) return h('span', { class: 'badge badge-warn' }, `${quantity} (bajo)`);
  return h('span', { class: 'badge' }, String(quantity));
}
