import { DEBT_STATES } from '../config.js';
import {
  h, icon, pageHeader, formatMoney,
  loadingState, emptyState, errorState,
} from '../ui.js';
import { formatDate, showInvoice } from '../invoice.js';
import { loadDebts, stateBadge, openPayment, showPayments } from '../debts.js';

export async function render(root) {
  const state = { entries: [], query: '', state: '' };
  const tableWrap = h('div', { class: 'table-wrap' });
  const stats = h('div', { class: 'stats' });
  const count = h('span', { class: 'count' });

  const searchInput = h('input', {
    class: 'input', type: 'search', placeholder: 'Buscar por cliente, cédula o factura', 'aria-label': 'Buscar deudas',
    oninput: (e) => { state.query = e.target.value; paint(); },
  });
  const stateFilter = h('select', {
    class: 'input', 'aria-label': 'Filtrar por estado',
    onchange: (e) => { state.state = e.target.value; paint(); },
  },
    h('option', { value: '' }, 'Todos los estados'),
    ...Object.entries(DEBT_STATES).map(([key, s]) => h('option', { value: key }, s.label)),
  );

  root.append(
    pageHeader('Deudas', 'Las deudas se generan al registrar una venta fiada',
      h('a', { class: 'btn btn-primary', href: '#/ventas' }, icon('plus'), 'Nueva venta fiada'),
    ),
    stats,
    h('div', { class: 'toolbar', style: 'margin-top:24px' },
      h('div', { class: 'search' }, icon('search'), searchInput),
      stateFilter,
      count,
    ),
    tableWrap,
  );

  async function load() {
    tableWrap.replaceChildren(loadingState('Cargando deudas...'));
    try {
      ({ entries: state.entries } = await loadDebts());
      paint();
    } catch (err) {
      tableWrap.replaceChildren(errorState(err, load));
    }
  }

  function visibleEntries() {
    const q = state.query.trim().toLowerCase();
    return state.entries
      .filter((e) => !state.state || e.debt.state === state.state)
      .filter((e) => !q || `${e.debt.customer?.name ?? ''} ${e.debt.customer?.document ?? ''} ${e.debt.sale?.id ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => (new Date(b.debt.date) - new Date(a.debt.date)) || (b.debt.id - a.debt.id));
  }

  function paintStats() {
    const pending = state.entries.filter((e) => e.debt.state === 'PENDIENTE');
    const tile = (label, value) => h('div', { class: 'stat' },
      h('p', { class: 'stat-label' }, label),
      h('p', { class: 'stat-value' }, value),
    );
    stats.replaceChildren(
      tile('Deudas pendientes', String(pending.length)),
      tile('Saldo por cobrar', formatMoney(pending.reduce((sum, e) => sum + e.outstanding, 0))),
    );
  }

  function paint() {
    paintStats();
    const rows = visibleEntries();
    count.textContent = `${rows.length} de ${state.entries.length} deudas`;

    if (rows.length) {
      tableWrap.replaceChildren(buildTable(rows));
    } else if (!state.entries.length) {
      tableWrap.replaceChildren(emptyState({
        title: 'Aún no hay deudas',
        text: 'Cuando registres una venta de tipo fiada, su deuda aparecerá aquí para que puedas abonarla.',
        action: h('a', { class: 'btn btn-primary', href: '#/ventas' }, 'Ir a Ventas'),
      }));
    } else {
      tableWrap.replaceChildren(emptyState({
        title: 'Sin resultados',
        text: 'Prueba con otro cliente, cédula, factura o estado.',
      }));
    }
  }

  function actionButton(iconName, label, onclick, disabled = false) {
    return h('button', { class: 'icon-btn', type: 'button', 'aria-label': label, title: label, disabled, onclick }, icon(iconName));
  }

  function buildTable(rows) {
    return h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {},
        h('th', {}, 'Cliente'),
        h('th', {}, 'Factura'),
        h('th', {}, 'Fecha'),
        h('th', { class: 'num' }, 'Total'),
        h('th', { class: 'num' }, 'Abonado'),
        h('th', { class: 'num' }, 'Saldo'),
        h('th', {}, 'Estado'),
        h('th', { class: 'actions-col' }, h('span', { class: 'sr-only' }, 'Acciones')),
      )),
      h('tbody', {}, ...rows.map((entry) => {
        const { debt } = entry;
        const canPay = debt.state === 'PENDIENTE' && entry.outstanding > 0;
        return h('tr', {},
          h('td', {},
            h('span', { class: 'cell-main' }, debt.customer?.name ?? ''),
            h('span', { class: 'cell-sub' }, debt.customer?.document ?? ''),
          ),
          h('td', {}, `N.° ${debt.sale?.id ?? ''}`),
          h('td', {}, formatDate(debt.date)),
          h('td', { class: 'num' }, formatMoney(entry.total)),
          h('td', { class: 'num' }, formatMoney(entry.paid)),
          h('td', { class: 'num' }, h('strong', {}, formatMoney(entry.outstanding))),
          h('td', {}, stateBadge(debt.state)),
          h('td', { class: 'actions-col' },
            h('div', { class: 'row-actions' },
              actionButton('eye', 'Ver factura', () => showInvoice(debt.sale)),
              actionButton('wallet', 'Ver abonos', () => showPayments(entry)),
              actionButton('plus', 'Registrar abono', () => openPayment(entry, load), !canPay),
            ),
          ),
        );
      })),
    );
  }

  await load();
}
