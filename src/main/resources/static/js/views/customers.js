import { customersApi } from '../api.js';
import {
  h, icon, toast, modal, field, pageHeader,
  loadingState, emptyState, errorState,
} from '../ui.js';

export async function render(root) {
  const state = { customers: [], query: '' };
  const tableWrap = h('div', { class: 'table-wrap' });
  const count = h('span', { class: 'count' });

  const searchInput = h('input', {
    class: 'input', type: 'search', placeholder: 'Buscar por nombre, cédula o teléfono', 'aria-label': 'Buscar clientes',
    oninput: (e) => { state.query = e.target.value; paint(); },
  });

  root.append(
    pageHeader('Clientes', 'Todo cliente debe estar registrado antes de una venta',
      h('button', { class: 'btn btn-primary', type: 'button', onclick: openCreate }, icon('plus'), 'Nuevo cliente'),
    ),
    h('div', { class: 'toolbar' },
      h('div', { class: 'search' }, icon('search'), searchInput),
      count,
    ),
    tableWrap,
  );

  async function load() {
    tableWrap.replaceChildren(loadingState('Cargando clientes...'));
    try {
      state.customers = await customersApi.list();
      paint();
    } catch (err) {
      tableWrap.replaceChildren(errorState(err, load));
    }
  }

  function visibleCustomers() {
    const q = state.query.trim().toLowerCase();
    return state.customers
      .filter((c) => !q || `${c.name} ${c.document} ${c.phone ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
  }

  function paint() {
    const rows = visibleCustomers();
    count.textContent = `${rows.length} de ${state.customers.length} clientes`;

    if (rows.length) {
      tableWrap.replaceChildren(buildTable(rows));
    } else if (!state.customers.length) {
      tableWrap.replaceChildren(emptyState({
        title: 'Aún no hay clientes',
        text: 'Registra a tu primer cliente para poder asociarle ventas.',
        action: h('button', { class: 'btn btn-primary', type: 'button', onclick: openCreate }, icon('plus'), 'Nuevo cliente'),
      }));
    } else {
      tableWrap.replaceChildren(emptyState({
        title: 'Sin resultados',
        text: 'Prueba con otro nombre, cédula o teléfono.',
      }));
    }
  }

  function buildTable(rows) {
    return h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {},
        h('th', {}, 'Nombre'),
        h('th', {}, 'Cédula'),
        h('th', {}, 'Teléfono'),
        h('th', {}, 'Dirección'),
        h('th', { class: 'actions-col' }, h('span', { class: 'sr-only' }, 'Acciones')),
      )),
      h('tbody', {}, ...rows.map((c) => h('tr', {},
        h('td', {}, h('span', { class: 'cell-main' }, c.name)),
        h('td', {}, c.document),
        h('td', {}, c.phone || '-'),
        h('td', {}, c.address || '-'),
        h('td', { class: 'actions-col' },
          h('div', { class: 'row-actions' },
            h('button', {
              class: 'icon-btn danger', type: 'button', 'aria-label': 'Eliminar cliente', title: 'Eliminar cliente',
              onclick: () => openDelete(c),
            }, icon('trash')),
          ),
        ),
      ))),
    );
  }

  function openCreate() {
    const document_ = h('input', { class: 'input', type: 'text', required: true, maxlength: '20', autocomplete: 'off' });
    const name = h('input', { class: 'input', type: 'text', required: true, maxlength: '120', autocomplete: 'off' });
    const phone = h('input', { class: 'input', type: 'tel', maxlength: '20', autocomplete: 'off' });
    const address = h('input', { class: 'input', type: 'text', maxlength: '200', autocomplete: 'off' });

    modal({
      title: 'Nuevo cliente',
      confirmLabel: 'Guardar cliente',
      body: h('div', { class: 'form-grid' },
        field('Cédula', document_),
        field('Teléfono', phone, 'Opcional'),
        h('div', { class: 'full' }, field('Nombre completo', name)),
        h('div', { class: 'full' }, field('Dirección', address, 'Opcional')),
      ),
      onConfirm: async () => {
        const saved = await customersApi.create({
          document: document_.value.trim(),
          name: name.value.trim(),
          phone: phone.value.trim() || null,
          address: address.value.trim() || null,
        });
        state.customers.push(saved);
        paint();
        toast(`Cliente "${saved.name}" registrado`, 'success');
      },
    });
  }

  function openDelete(customer) {
    modal({
      title: 'Eliminar cliente',
      confirmLabel: 'Eliminar',
      danger: true,
      body: h('div', { class: 'modal-body-stack' },
        h('p', {}, `Se eliminará a "${customer.name}" (cédula ${customer.document}). Esta acción no se puede deshacer.`),
        h('p', { class: 'field-hint' }, 'Si el cliente tiene facturas o deudas asociadas, el servidor puede rechazar la eliminación.'),
      ),
      onConfirm: async () => {
        await customersApi.remove(customer.id);
        state.customers = state.customers.filter((c) => c.id !== customer.id);
        paint();
        toast('Cliente eliminado', 'success');
      },
    });
  }

  await load();
}
