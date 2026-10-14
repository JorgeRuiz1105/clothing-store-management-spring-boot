import { articlesApi } from '../api.js';
import { SECTIONS, LOW_STOCK_THRESHOLD } from '../config.js';
import { h, icon, pageHeader, formatMoney } from '../ui.js';

function statTile(label) {
  const value = h('p', { class: 'stat-value' }, '...');
  return { node: h('div', { class: 'stat' }, h('p', { class: 'stat-label' }, label), value), value };
}

export async function render(root) {
  const tiles = {
    total: statTile('Artículos registrados'),
    units: statTile('Unidades en inventario'),
    worth: statTile('Valor del inventario'),
    low: statTile(`Agotados o con ${LOW_STOCK_THRESHOLD} unidades o menos`),
  };
  const note = h('p', { class: 'muted', hidden: true });

  const menu = h('div', { class: 'menu-grid' },
    ...SECTIONS.filter((s) => s.path !== 'inicio').map((s) =>
      h('a', { class: 'menu-item', href: `#/${s.path}` },
        icon(s.icon, 20),
        h('div', {},
          h('p', { class: 'menu-item-title' }, s.label),
          h('p', { class: 'menu-item-text' }, s.description),
        ),
      ),
    ),
  );

  root.append(
    pageHeader('Inicio', 'Resumen de la tienda'),
    h('div', { class: 'stats' }, ...Object.values(tiles).map((t) => t.node)),
    note,
    h('h2', { class: 'section-title' }, 'Ir a'),
    menu,
  );

  try {
    const articles = await articlesApi.list();
    tiles.total.value.textContent = String(articles.length);
    tiles.units.value.textContent = String(articles.reduce((sum, a) => sum + a.quantity, 0));
    tiles.worth.value.textContent = formatMoney(articles.reduce((sum, a) => sum + Number(a.price) * a.quantity, 0));
    tiles.low.value.textContent = String(articles.filter((a) => a.quantity <= LOW_STOCK_THRESHOLD).length);
  } catch (err) {
    Object.values(tiles).forEach((t) => { t.value.textContent = '-'; });
    note.textContent = `No se pudo leer el inventario: ${err.message}`;
    note.hidden = false;
  }
}
