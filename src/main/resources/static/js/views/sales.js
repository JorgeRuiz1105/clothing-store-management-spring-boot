import { articlesApi, customersApi, salesApi } from '../api.js';
import { SALE_TYPES } from '../config.js';
import {
  h, icon, toast, modal, pageHeader, formatMoney,
  loadingState, emptyState, errorState,
} from '../ui.js';
import { showInvoice } from '../invoice.js';

export async function render(root) {
  const cart = new Map();
  let articles = [];
  let query = '';
  let customer = null;
  let saleType = 'CONTADO';

  const catalog = h('div', { class: 'catalog' });
  const cartLines = h('div');
  const totalValue = h('span');

  const customerList = h('datalist', { id: 'customer-options' });
  const customerStatus = h('p', { class: 'field-hint customer-status', 'aria-live': 'polite' });
  const customerInput = h('input', {
    class: 'input', type: 'text', list: 'customer-options', autocomplete: 'off',
    placeholder: 'Cédula del cliente',
    oninput: () => { customer = null; setCustomerStatus(); },
    onchange: lookupCustomer,
  });

  const typeHint = h('p', { class: 'field-hint' }, SALE_TYPES[saleType].hint);
  const typeInputs = {};
  const typeGroup = h('fieldset', { class: 'segmented' },
    h('legend', { class: 'sr-only' }, 'Tipo de venta'),
    ...Object.entries(SALE_TYPES).map(([key, t]) => {
      const input = h('input', {
        type: 'radio', name: 'sale-type', value: key, checked: key === saleType,
        onchange: () => { saleType = key; typeHint.textContent = t.hint; },
      });
      typeInputs[key] = input;
      return h('label', { class: 'segment' }, input, h('span', {}, t.label));
    }),
  );

  const checkoutBtn = h('button', { class: 'btn btn-primary', type: 'button', onclick: checkout }, 'Cobrar');
  const clearBtn = h('button', {
    class: 'btn btn-ghost btn-sm', type: 'button',
    onclick: () => { cart.clear(); paintCart(); paintCatalog(); },
  }, 'Vaciar');
  const searchInput = h('input', {
    class: 'input', type: 'search', placeholder: 'Buscar por nombre, color o talla', 'aria-label': 'Buscar en el catálogo',
    oninput: (e) => { query = e.target.value; paintCatalog(); },
  });

  root.append(
    pageHeader('Ventas', 'Elige al cliente, arma el carrito y cobra'),
    h('div', { class: 'sales' },
      h('section', { class: 'panel', 'aria-label': 'Catálogo' },
        h('div', { class: 'panel-head' }, h('div', { class: 'search', style: 'flex:1' }, icon('search'), searchInput)),
        catalog,
      ),
      h('aside', { class: 'panel cart', 'aria-label': 'Factura actual' },
        h('div', { class: 'panel-head' }, h('h2', {}, 'Factura actual'), clearBtn),
        h('div', { class: 'cart-setup' },
          h('label', { class: 'field' },
            h('span', { class: 'field-label' }, 'Cliente'),
            customerInput,
            customerStatus,
          ),
          h('div', { class: 'field' },
            h('span', { class: 'field-label' }, 'Tipo de venta'),
            typeGroup,
            typeHint,
          ),
          customerList,
        ),
        cartLines,
        h('div', { class: 'cart-foot' },
          h('div', { class: 'cart-total' }, h('span', {}, 'Total'), totalValue),
          checkoutBtn,
        ),
      ),
    ),
  );

  function setCustomerStatus(text = '', kind = '', showLink = false) {
    customerStatus.className = `field-hint customer-status${kind ? ` is-${kind}` : ''}`;
    customerStatus.replaceChildren(text, showLink ? h('a', { href: '#/clientes' }, ' Registrar cliente') : '');
  }

  async function lookupCustomer() {
    const document_ = customerInput.value.trim();
    customer = null;
    if (!document_) { setCustomerStatus(); return; }

    setCustomerStatus('Buscando cliente...');
    try {
      const found = await customersApi.getByDocument(document_);
      if (customerInput.value.trim() !== document_) return;
      customer = found;
      setCustomerStatus(found.name, 'ok');
    } catch (err) {
      if (customerInput.value.trim() !== document_) return;
      if (err.status === 404) setCustomerStatus('No hay un cliente registrado con esa cédula.', 'error', true);
      else setCustomerStatus(err.message, 'error');
    }
  }

  function fillCustomerSuggestions(customers) {
    customerList.replaceChildren(...customers.map((c) => h('option', { value: c.document, label: c.name })));
  }

  function cartTotal() {
    return [...cart.values()].reduce((sum, { article, qty }) => sum + Number(article.price) * qty, 0);
  }

  function addToCart(article) {
    const line = cart.get(article.id);
    if (!line) cart.set(article.id, { article, qty: 1 });
    else if (line.qty < article.quantity) line.qty += 1;
    paintCart();
    paintCatalog();
  }

  function changeQty(id, delta) {
    const line = cart.get(id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart.delete(id);
    paintCart();
    paintCatalog();
  }

  function removeLine(id) {
    cart.delete(id);
    paintCart();
    paintCatalog();
  }

  function paintCart() {
    const lines = [...cart.values()];
    if (!lines.length) {
      cartLines.replaceChildren(h('p', { class: 'cart-empty' }, 'El carrito está vacío. Agrega artículos desde el catálogo.'));
    } else {
      cartLines.replaceChildren(...lines.map(({ article, qty }) => h('div', { class: 'cart-line' },
        h('div', {},
          h('p', { class: 'catalog-name' }, article.name),
          h('p', { class: 'catalog-meta' }, `${article.size}, ${article.color} - ${formatMoney(article.price)} c/u`),
        ),
        h('p', { class: 'cart-line-total' }, formatMoney(Number(article.price) * qty)),
        h('div', { class: 'cart-qty' },
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Quitar una unidad', onclick: () => changeQty(article.id, -1) }, icon('minus', 14)),
          h('output', {}, String(qty)),
          h('button', {
            class: 'icon-btn', type: 'button', 'aria-label': 'Agregar una unidad',
            disabled: qty >= article.quantity, onclick: () => changeQty(article.id, 1),
          }, icon('plus', 14)),
        ),
        h('div', { style: 'text-align:right' },
          h('button', { class: 'icon-btn danger', type: 'button', 'aria-label': 'Quitar del carrito', title: 'Quitar del carrito', onclick: () => removeLine(article.id) }, icon('trash', 16)),
        ),
      )));
    }
    totalValue.textContent = formatMoney(cartTotal());
    checkoutBtn.disabled = !lines.length;
    clearBtn.hidden = !lines.length;
  }

  function resetSale() {
    cart.clear();
    customer = null;
    customerInput.value = '';
    setCustomerStatus();
    saleType = 'CONTADO';
    typeInputs.CONTADO.checked = true;
    typeHint.textContent = SALE_TYPES.CONTADO.hint;
    paintCart();
  }

  async function checkout() {
    if (!cart.size) return;

    if (!customer) await lookupCustomer();
    if (!customer) {
      toast('Selecciona un cliente registrado para continuar.', 'error');
      customerInput.focus();
      return;
    }

    const buyer = customer;
    const lines = [...cart.values()];
    const units = lines.reduce((sum, { qty }) => sum + qty, 0);
    const total = cartTotal();
    const row = (label, value) => [h('dt', {}, label), h('dd', {}, value)];

    let warning = null;
    let warningFailed = false;
    checkoutBtn.disabled = true;
    try {
      warning = await customersApi.debtWarning(buyer.document);
    } catch {
      warningFailed = true;
    } finally {
      checkoutBtn.disabled = !cart.size;
    }

    modal({
      title: 'Confirmar venta',
      confirmLabel: `Cobrar ${formatMoney(total)}`,
      body: h('div', { class: 'modal-body-stack' },
        warning?.hasHighDebt ? h('p', { class: 'notice-warn', role: 'alert' }, warning.message) : null,
        h('dl', { class: 'details' },
          ...row('Cliente', `${buyer.name} (${buyer.document})`),
          ...row('Tipo de venta', SALE_TYPES[saleType].label),
          ...row('Artículos', `${lines.length} (${units} unidades)`),
          ...row('Total', formatMoney(total)),
        ),
        h('p', { class: 'field-hint' }, SALE_TYPES[saleType].hint),
        warningFailed ? h('p', { class: 'field-hint' }, 'No se pudo verificar si el cliente tiene una deuda pendiente elevada.') : null,
      ),
      onConfirm: async () => {
        const sale = await salesApi.create({
          type: saleType,
          customerDocument: buyer.document,
          items: Object.fromEntries(lines.map(({ article, qty }) => [article.id, qty])),
        });

        resetSale();
        toast(`Factura N.° ${sale.id} registrada`, 'success');
        refreshArticles(); // el stock cambió
        setTimeout(() => showInvoice(sale), 0);
      },
    });
  }

  function paintCatalog() {
    const q = query.trim().toLowerCase();
    const rows = articles
      .filter((a) => !q || `${a.name} ${a.color} ${a.size}`.toLowerCase().includes(q))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));

    if (!rows.length) {
      catalog.replaceChildren(emptyState({
        title: articles.length ? 'Sin resultados' : 'No hay artículos',
        text: articles.length ? 'Prueba con otro nombre, color o talla.' : 'Primero registra artículos en la sección Artículos.',
      }));
      return;
    }

    catalog.replaceChildren(...rows.map((a) => {
      const inCart = cart.get(a.id)?.qty ?? 0;
      const soldOut = a.quantity <= 0;
      const maxed = !soldOut && inCart >= a.quantity;
      return h('div', { class: 'catalog-item' },
        h('div', {},
          h('p', { class: 'catalog-name' }, a.name),
          h('p', { class: 'catalog-meta' }, `${a.size}, ${a.color} - ${soldOut ? 'Agotado' : `${a.quantity} disponibles`}`),
        ),
        h('p', { class: 'catalog-price' }, formatMoney(a.price)),
        h('button', {
          class: 'btn btn-ghost btn-sm', type: 'button', disabled: soldOut || maxed,
          onclick: () => addToCart(a),
        }, icon('plus', 16), maxed ? 'En carrito' : 'Agregar'),
      );
    }));
  }

  async function load() {
    catalog.replaceChildren(loadingState('Cargando catálogo...'));
    try {
      articles = await articlesApi.list();
      paintCatalog();
    } catch (err) {
      catalog.replaceChildren(errorState(err, load));
    }
  }

  async function refreshArticles() {
    try {
      articles = await articlesApi.list();
    } catch {
    }
    paintCatalog();
  }

  paintCart();
  customersApi.list().then(fillCustomerSuggestions).catch(() => {});
  await load();
}
