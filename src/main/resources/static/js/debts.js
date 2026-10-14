import { debtsApi, paymentsApi } from './api.js';
import { DEBT_STATES } from './config.js';
import { h, modal, toast, formatMoney } from './ui.js';
import { saleTotal, formatDate } from './invoice.js';

const round2 = (n) => Math.round(n * 100) / 100;

export async function loadDebts() {
  const [debts, payments] = await Promise.all([debtsApi.list(), paymentsApi.list()]);

  const paymentsByDebt = new Map();
  for (const payment of payments) {
    const debtId = payment.debt?.id;
    if (debtId === undefined || debtId === null) continue;
    if (!paymentsByDebt.has(debtId)) paymentsByDebt.set(debtId, []);
    paymentsByDebt.get(debtId).push(payment);
  }

  const entries = debts.map((debt) => {
    const list = (paymentsByDebt.get(debt.id) ?? []).sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = saleTotal(debt.sale ?? {});
    const paid = round2(list.reduce((sum, p) => sum + Number(p.amount), 0));
    return { debt, payments: list, total, paid, outstanding: Math.max(round2(total - paid), 0) };
  });

  return { entries, payments };
}

export function stateBadge(state) {
  const label = DEBT_STATES[state]?.label ?? state;
  return h('span', { class: `badge${state === 'PENDIENTE' ? ' badge-warn' : ''}` }, label);
}

const row = (label, value) => [h('dt', {}, label), h('dd', {}, value)];

export function openPayment(entry, onDone) {
  const { debt, total, paid, outstanding } = entry;

  const amount = h('input', {
    id: 'payment-amount', class: 'input', type: 'number', required: true,
    min: '0.01', max: String(outstanding), step: 'any', inputmode: 'decimal',
  });
  const fillAll = h('button', {
    class: 'btn btn-ghost btn-sm', type: 'button',
    onclick: () => { amount.value = String(outstanding); amount.focus(); },
  }, 'Saldo completo');

  modal({
    title: 'Registrar abono',
    confirmLabel: 'Registrar abono',
    body: h('div', { class: 'modal-body-stack' },
      h('dl', { class: 'details' },
        ...row('Cliente', `${debt.customer?.name ?? ''} (${debt.customer?.document ?? ''})`),
        ...row('Factura', `N.° ${debt.sale?.id ?? ''}`),
        ...row('Total de la deuda', formatMoney(total)),
        ...row('Abonado', formatMoney(paid)),
        ...row('Saldo pendiente', formatMoney(outstanding)),
      ),
      h('div', { class: 'field' },
        h('label', { class: 'field-label', for: 'payment-amount' }, 'Monto del abono'),
        h('div', { class: 'input-row' }, amount, fillAll),
        h('span', { class: 'field-hint' }, `Máximo ${formatMoney(outstanding)}`),
      ),
    ),
    onConfirm: async () => {
      const value = Number(amount.value);
      await paymentsApi.create({ amount: value, debtId: debt.id });
      toast(value >= outstanding ? 'Abono registrado. La deuda quedó saldada.' : 'Abono registrado', 'success');
      try { await onDone?.(); } catch {  }
    },
  });
}

export function showPayments(entry) {
  const { debt, payments, total, paid, outstanding } = entry;

  const body = payments.length
    ? h('div', { class: 'table-wrap' },
      h('table', { class: 'data-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Fecha'), h('th', { class: 'num' }, 'Monto'))),
        h('tbody', {}, ...payments.map((p) => h('tr', {},
          h('td', {}, formatDate(p.date)),
          h('td', { class: 'num' }, formatMoney(p.amount)),
        ))),
      ))
    : h('p', { class: 'muted' }, 'Esta deuda aún no tiene abonos.');

  modal({
    title: `Abonos de la factura N.° ${debt.sale?.id ?? ''}`,
    body: h('div', { class: 'modal-body-stack' },
      h('dl', { class: 'details' },
        ...row('Cliente', debt.customer?.name ?? ''),
        ...row('Total de la deuda', formatMoney(total)),
        ...row('Abonado', formatMoney(paid)),
        ...row('Saldo pendiente', formatMoney(outstanding)),
      ),
      body,
    ),
  });
}
