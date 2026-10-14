import { LOCALE, SALE_TYPES } from './config.js';
import { h, modal, formatMoney } from './ui.js';

export function saleTotal(sale) {
  return (sale.itemSaleList ?? []).reduce((sum, item) => sum + Number(item.unitPrice) * item.amount, 0);
}

const dateFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' });

export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date);
}

export function typeBadge(type) {
  const label = SALE_TYPES[type]?.label ?? type;
  return h('span', { class: `badge${type === 'FIADA' ? ' badge-warn' : ''}` }, label);
}

export function showInvoice(sale) {
  const items = sale.itemSaleList ?? [];
  const row = (label, value) => [h('dt', {}, label), h('dd', {}, value)];

  modal({
    title: `Factura N.° ${sale.id}`,
    wide: true,
    body: h('div', { class: 'modal-body-stack' },
      h('dl', { class: 'details' },
        ...row('Cliente', sale.customer?.name ?? ''),
        ...row('Cédula', sale.customer?.document ?? ''),
        ...row('Fecha', formatDate(sale.date)),
        ...row('Tipo', typeBadge(sale.type)),
      ),
      h('div', { class: 'table-wrap' },
        h('table', { class: 'data-table' },
          h('thead', {}, h('tr', {},
            h('th', {}, 'Artículo'),
            h('th', { class: 'num' }, 'Cant.'),
            h('th', { class: 'num' }, 'Precio'),
            h('th', { class: 'num' }, 'Subtotal'),
          )),
          h('tbody', {}, ...items.map((item) => h('tr', {},
            h('td', {},
              h('span', { class: 'cell-main' }, item.article?.name ?? ''),
              h('span', { class: 'cell-sub' }, [item.article?.size, item.article?.color].filter(Boolean).join(', ')),
            ),
            h('td', { class: 'num' }, String(item.amount)),
            h('td', { class: 'num' }, formatMoney(item.unitPrice)),
            h('td', { class: 'num' }, formatMoney(Number(item.unitPrice) * item.amount)),
          ))),
        ),
      ),
      h('p', { class: 'invoice-total' }, h('span', {}, 'Total'), h('strong', {}, formatMoney(saleTotal(sale)))),
    ),
  });
}
