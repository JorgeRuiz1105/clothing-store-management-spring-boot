import {
  h, icon, toast, modal, field, pageHeader, formatMoney,
  loadingState, emptyState, errorState,
} from '../ui.js';
import { formatDate } from '../invoice.js';
import { loadDebts, openPayment } from '../debts.js';

export async function render(root) {
  const state = { entries: [], payments: [], query: '' };
  const tableWrap = h('div', { class: 'table-wrap' });
  const count = h('span', { class: 'count' });

  const searchInput = h('input', {
    class: 'input', type: 'search', placeholder: 'Buscar por cliente, cédula, factura o número', 'aria-label': 'Buscar abonos',
    oninput: (e) => { state.query = e.target.value; paint(); },
  });

  root.append(
    pageHeader('Abonos', 'Pagos registrados a las deudas',
      h('button', { class: 'btn btn-primary', type: 'button', onclick: openRegister }, icon('plus'), 'Registrar abono'),
    ),
    h('div', { class: 'toolbar' },
      h('div', { class: 'search' }, icon('search'), searchInput),
      count,
    ),
    tableWrap,
  );

  async function load() {
    tableWrap.replaceChildren(loadingState('Cargando abonos...'));
    try {
      ({ entries: state.entries, payments: state.payments } = await loadDebts());
      paint();
    } catch (err) {
      tableWrap.replaceChildren(errorState(err, load));
    }
  }

  function visiblePayments() {
    const q = state.query.trim().toLowerCase();
    return state.payments
      .filter((p) => !q || `${p.id} ${p.debt?.customer?.name ?? ''} ${p.debt?.customer?.document ?? ''} ${p.debt?.sale?.id ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => (new Date(b.date) - new Date(a.date)) || (b.id - a.id));
  }

  function paint() {
    const rows = visiblePayments();
    count.textContent = `${rows.length} de ${state.payments.length} abonos`;

    if (rows.length) {
      tableWrap.replaceChildren(buildTable(rows));
    } else if (!state.payments.length) {
      tableWrap.replaceChildren(emptyState({
        title: 'Aún no hay abonos',
        text: 'Registra el primer abono a una deuda pendiente.',
        action: h('button', { class: 'btn btn-primary', type: 'button', onclick: openRegister }, icon('plus'), 'Registrar abono'),
      }));
    } else {
      tableWrap.replaceChildren(emptyState({
        title: 'Sin resultados',
        text: 'Prueba con otro cliente, cédula, factura o número de abono.',
      }));
    }
  }

  function buildTable(rows) {
    return h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {},
        h('th', {}, 'N.°'),
        h('th', {}, 'Fecha'),
        h('th', {}, 'Cliente'),
        h('th', {}, 'Factura'),
        h('th', { class: 'num' }, 'Monto'),
      )),
      h('tbody', {}, ...rows.map((p) => h('tr', {},
        h('td', {}, h('span', { class: 'cell-main' }, String(p.id))),
        h('td', {}, formatDate(p.date)),
        h('td', {},
          h('span', { class: 'cell-main' }, p.debt?.customer?.name ?? ''),
          h('span', { class: 'cell-sub' }, p.debt?.customer?.document ?? ''),
        ),
        h('td', {}, `N.° ${p.debt?.sale?.id ?? ''}`),
        h('td', { class: 'num' }, formatMoney(p.amount)),
      ))),
    );
  }

  function openRegister() {
    const pending = state.entries
      .filter((e) => e.debt.state === 'PENDIENTE' && e.outstanding > 0)
      .sort((a, b) => String(a.debt.customer?.name).localeCompare(String(b.debt.customer?.name), 'es'));

    if (!pending.length) {
      toast('No hay deudas pendientes. Las deudas se generan al registrar una venta fiada.', 'info');
      return;
    }

    const select = h('select', { class: 'input', required: true },
      ...pending.map((e) => h('option', { value: String(e.debt.id) },
        `${e.debt.customer?.name ?? ''} - Factura N.° ${e.debt.sale?.id ?? ''} - Saldo ${formatMoney(e.outstanding)}`)),
    );

    modal({
      title: 'Registrar abono',
      confirmLabel: 'Continuar',
      body: field('Deuda a abonar', select),
      onConfirm: async () => {
        const entry = pending.find((e) => String(e.debt.id) === select.value);
        if (entry) setTimeout(() => openPayment(entry, load), 0);
      },
    });
  }

  await load();
}
