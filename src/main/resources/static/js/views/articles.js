import { articlesApi } from '../api.js';
import { CATEGORIES } from '../config.js';
import {
  h, icon, toast, modal, field, pageHeader, formatMoney,
  loadingState, emptyState, errorState, stockBadge,
} from '../ui.js';

const categoryLabel = (key) => CATEGORIES[key]?.label ?? key;

export async function render(root) {
  const state = { articles: [], query: '', category: '' };
  const tableWrap = h('div', { class: 'table-wrap' });
  const count = h('span', { class: 'count' });

  const searchInput = h('input', {
    class: 'input', type: 'search', placeholder: 'Buscar por nombre o color', 'aria-label': 'Buscar artículos',
    oninput: (e) => { state.query = e.target.value; paint(); },
  });
  const categoryFilter = h('select', {
    class: 'input', 'aria-label': 'Filtrar por categoría',
    onchange: (e) => { state.category = e.target.value; paint(); },
  },
    h('option', { value: '' }, 'Todas las categorías'),
    ...Object.entries(CATEGORIES).map(([key, c]) => h('option', { value: key }, c.label)),
  );

  root.append(
    pageHeader('Artículos', 'Inventario de la tienda',
      h('button', { class: 'btn btn-primary', type: 'button', onclick: openCreate }, icon('plus'), 'Nuevo artículo'),
    ),
    h('div', { class: 'toolbar' },
      h('div', { class: 'search' }, icon('search'), searchInput),
      categoryFilter,
      count,
    ),
    tableWrap,
  );

  // ----- Datos -----
  async function load() {
    tableWrap.replaceChildren(loadingState('Cargando artículos...'));
    try {
      state.articles = await articlesApi.list();
      paint();
    } catch (err) {
      tableWrap.replaceChildren(errorState(err, load));
    }
  }

  function visibleArticles() {
    const q = state.query.trim().toLowerCase();
    return state.articles
      .filter((a) => !state.category || a.category === state.category)
      .filter((a) => !q || `${a.name} ${a.color}`.toLowerCase().includes(q))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
  }

  function paint() {
    const rows = visibleArticles();
    count.textContent = `${rows.length} de ${state.articles.length} artículos`;

    if (rows.length) {
      tableWrap.replaceChildren(buildTable(rows));
    } else if (!state.articles.length) {
      tableWrap.replaceChildren(emptyState({
        title: 'Aún no hay artículos',
        text: 'Registra el primer artículo para empezar a controlar el inventario.',
        action: h('button', { class: 'btn btn-primary', type: 'button', onclick: openCreate }, icon('plus'), 'Nuevo artículo'),
      }));
    } else {
      tableWrap.replaceChildren(emptyState({
        title: 'Sin resultados',
        text: 'Prueba con otro nombre, color o categoría.',
      }));
    }
  }

  function actionButton(iconName, label, onclick, danger = false) {
    return h('button', {
      class: `icon-btn${danger ? ' danger' : ''}`, type: 'button', 'aria-label': label, title: label, onclick,
    }, icon(iconName));
  }

  function buildTable(rows) {
    return h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {},
        h('th', {}, 'Artículo'),
        h('th', {}, 'Categoría'),
        h('th', {}, 'Talla'),
        h('th', {}, 'Color'),
        h('th', { class: 'num' }, 'Precio'),
        h('th', { class: 'num' }, 'Stock'),
        h('th', { class: 'actions-col' }, h('span', { class: 'sr-only' }, 'Acciones')),
      )),
      h('tbody', {}, ...rows.map((a) => h('tr', {},
        h('td', {},
          h('span', { class: 'cell-main' }, a.name),
          h('span', { class: 'cell-sub' }, `Código ${a.id}`),
        ),
        h('td', {}, categoryLabel(a.category)),
        h('td', {}, a.size),
        h('td', {}, a.color),
        h('td', { class: 'num' }, formatMoney(a.price)),
        h('td', { class: 'num' }, stockBadge(a.quantity)),
        h('td', { class: 'actions-col' },
          h('div', { class: 'row-actions' },
            actionButton('eye', 'Ver detalle', () => openDetail(a)),
              actionButton('edit', 'Editar', () => openEdit(a)),
            actionButton('in', 'Registrar entrada', () => openMovement(a, 'intake')),
            actionButton('out', 'Registrar salida', () => openMovement(a, 'outflow')),
            actionButton('trash', 'Eliminar', () => openDelete(a), true),
          ),
        ),
      ))),
    );
  }

  function openCreate() {
    openForm(null);
  }

  async function openEdit(article) {
    try {
      // Se relee el artículo para mostrar siempre los datos actuales.
      openForm(await articlesApi.get(article.id));
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function openForm(existing) {
    const isEdit = existing !== null;

    const category = h('select', { class: 'input', required: true },
        ...Object.entries(CATEGORIES).map(([key, c]) => h('option', { value: key }, c.label)),
    );
    const size = h('select', { class: 'input', required: true });
    const fillSizes = () => {
      size.replaceChildren(...CATEGORIES[category.value].sizes.map((s) => h('option', { value: s }, s)));
    };
    category.addEventListener('change', fillSizes);

    const name = h('input', { class: 'input', type: 'text', required: true, maxlength: '120', placeholder: 'Ej. Camisa de lino' });
    const color = h('input', { class: 'input', type: 'text', required: true, maxlength: '40', placeholder: 'Ej. Azul' });
    const price = h('input', { class: 'input', type: 'number', required: true, min: '0', step: 'any', inputmode: 'decimal' });
    const quantity = h('input', { class: 'input', type: 'number', required: true, min: '0', step: '1', value: '1', inputmode: 'numeric' });

    if (isEdit) {
      category.value = existing.category;
      fillSizes();
      size.value = existing.size;
      name.value = existing.name;
      color.value = existing.color;
      price.value = existing.price;
      quantity.value = existing.quantity;
      quantity.disabled = true; // el stock se cambia con Entrada y Salida
    } else {
      fillSizes();
    }

    modal({
      title: isEdit ? 'Editar artículo' : 'Nuevo artículo',
      confirmLabel: isEdit ? 'Guardar cambios' : 'Guardar artículo',
      body: h('div', { class: 'form-grid' },
          h('div', { class: 'full' }, field('Nombre', name)),
          field('Categoría', category),
          field('Talla', size),
          field('Color', color),
          field('Precio', price),
          h('div', { class: 'full' },
              field(isEdit ? 'Cantidad en stock' : 'Cantidad inicial', quantity, isEdit ? 'Para cambiarla usa Entrada o Salida' : null),
          ),
      ),
      onConfirm: async () => {
        const data = {
          name: name.value.trim(),
          size: size.value,
          color: color.value.trim(),
          price: Number(price.value),
          quantity: Number.parseInt(quantity.value, 10),
          category: category.value,
        };

        if (isEdit) {
          const updated = await articlesApi.update(existing.id, data);
          const i = state.articles.findIndex((x) => x.id === existing.id);
          if (i >= 0) state.articles[i] = updated;
          paint();
          toast(`Artículo "${updated.name}" actualizado`, 'success');
        } else {
          const saved = await articlesApi.create(data);
          state.articles.push(saved);
          paint();
          toast(`Artículo "${saved.name}" creado`, 'success');
        }
      },
    });
  }

  async function openDetail(article) {
    try {
      const a = await articlesApi.get(article.id);
      const row = (label, value) => [h('dt', {}, label), h('dd', {}, value)];
      modal({
        title: a.name,
        body: h('dl', { class: 'details' },
          ...row('Código', String(a.id)),
          ...row('Categoría', categoryLabel(a.category)),
          ...row('Talla', a.size),
          ...row('Color', a.color),
          ...row('Precio', formatMoney(a.price)),
          ...row('Unidades en stock', String(a.quantity)),
        ),
      });
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function openMovement(article, kind) {
    const isIntake = kind === 'intake';
    if (!isIntake && article.quantity <= 0) {
      toast('Este artículo no tiene unidades disponibles para registrar una salida.', 'error');
      return;
    }

    const quantity = h('input', {
      class: 'input', type: 'number', required: true, min: '1', step: '1', value: '1', inputmode: 'numeric',
      max: isIntake ? null : String(article.quantity),
    });

    modal({
      title: isIntake ? 'Registrar entrada' : 'Registrar salida',
      confirmLabel: isIntake ? 'Registrar entrada' : 'Registrar salida',
      body: h('div', { class: 'modal-body-stack' },
        h('p', {}, `${article.name} (${article.size}, ${article.color}). Stock actual: ${article.quantity}.`),
        field('Cantidad', quantity, isIntake ? null : `Máximo ${article.quantity}`),
      ),
      onConfirm: async () => {
        const amount = Number.parseInt(quantity.value, 10);
        await articlesApi[kind](article.id, amount);
        try {
          const fresh = await articlesApi.get(article.id);
          const i = state.articles.findIndex((x) => x.id === article.id);
          if (i >= 0) state.articles[i] = fresh;
        } catch {
          article.quantity += isIntake ? amount : -amount; // respaldo si la relectura falla
        }
        paint();
        toast(isIntake ? 'Entrada registrada' : 'Salida registrada', 'success');
      },
    });
  }

  function openDelete(article) {
    modal({
      title: 'Eliminar artículo',
      confirmLabel: 'Eliminar',
      danger: true,
      body: h('p', {}, `Se eliminará "${article.name}" del inventario. Esta acción no se puede deshacer.`),
      onConfirm: async () => {
        await articlesApi.remove(article.id);
        state.articles = state.articles.filter((x) => x.id !== article.id);
        paint();
        toast('Artículo eliminado', 'success');
      },
    });
  }

  await load();
}
