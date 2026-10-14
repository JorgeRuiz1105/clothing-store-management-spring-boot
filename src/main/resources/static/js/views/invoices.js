import { salesApi } from '../api.js';
import { SALE_TYPES } from '../config.js';
import {
  h, icon, toast, pageHeader, formatMoney,
  loadingState, emptyState, errorState,
} from '../ui.js';
import { saleTotal, formatDate, typeBadge, showInvoice } from '../invoice.js';

export async function render(root) {
  const state = { sales: [], query: '', type: '' };
  const tableWrap = h('div', { class: 'table-wrap' });
  const count = h('span', { class: 'count' });

  const searchInput = h('input', {
    class: 'input', type: 'search', placeholder: 'Buscar por número, cliente o cédula', 'aria-label': 'Buscar facturas',
    oninput: (e) => { state.query = e.target.value; paint(); },
  });
  const typeFilter = h('select', {
    class: 'input', 'aria-label': 'Filtrar por tipo de venta',
    onchange: (e) => { state.type = e.target.value; paint(); },
  },
    h('option', { value: '' }, 'Todos los tipos'),
    ...Object.entries(SALE_TYPES).map(([key, t]) => h('option', { value: key }, t.label)),
  );

  root.append(
    pageHeader('Facturas', 'Historial de ventas realizadas',
      h('a', { class: 'btn btn-primary', href: '#/ventas' }, icon('plus'), 'Nueva venta'),
    ),
    h('div', { class: 'toolbar' },
      h('div', { class: 'search' }, icon('search'), searchInput),
      typeFilter,
      count,
    ),
    tableWrap,
  );

  async function load() {
    tableWrap.replaceChildren(loadingState('Cargando facturas...'));
    try {
      state.sales = await salesApi.list();
      paint();
    } catch (err) {
      tableWrap.replaceChildren(errorState(err, load));
    }
  }

  function visibleSales() {
    const q = state.query.trim().toLowerCase();
    return state.sales
      .filter((s) => !state.type || s.type === state.type)
      .filter((s) => !q || `${s.id} ${s.customer?.name ?? ''} ${s.customer?.document ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => (new Date(b.date) - new Date(a.date)) || (b.id - a.id));
  }

  function paint() {
    const rows = visibleSales();
    count.textContent = `${rows.length} de ${state.sales.length} facturas`;

    if (rows.length) {
      tableWrap.replaceChildren(buildTable(rows));
    } else if (!state.sales.length) {
      tableWrap.replaceChildren(emptyState({
        title: 'Aún no hay facturas',
        text: 'Las ventas que registres aparecerán aquí.',
        action: h('a', { class: 'btn btn-primary', href: '#/ventas' }, 'Crear una venta'),
      }));
    } else {
      tableWrap.replaceChildren(emptyState({
        title: 'Sin resultados',
        text: 'Prueba con otro número, cliente o tipo de venta.',
      }));
    }
  }

  function buildTable(rows) {
    return h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {},
        h('th', {}, 'N.°'),
        h('th', {}, 'Fecha'),
        h('th', {}, 'Cliente'),
        h('th', {}, 'Tipo'),
        h('th', { class: 'num' }, 'Total'),
        h('th', { class: 'actions-col' }, h('span', { class: 'sr-only' }, 'Acciones')),
      )),
      h('tbody', {}, ...rows.map((s) => h('tr', {},
        h('td', {}, h('span', { class: 'cell-main' }, String(s.id))),
        h('td', {}, formatDate(s.date)),
        h('td', {},
          h('span', { class: 'cell-main' }, s.customer?.name ?? ''),
          h('span', { class: 'cell-sub' }, s.customer?.document ?? ''),
        ),
        h('td', {}, typeBadge(s.type)),
        h('td', { class: 'num' }, formatMoney(saleTotal(s))),
        h('td', { class: 'actions-col' },
          h('div', { class: 'row-actions' },
            h('button', {
              class: 'icon-btn', type: 'button', 'aria-label': 'Ver factura', title: 'Ver factura',
              onclick: () => openInvoice(s),
            }, icon('eye')),
          ),
        ),
      ))),
    );
  }

  async function openInvoice(sale) {
    try {
      showInvoice(await salesApi.get(sale.id));
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  await load();
}
