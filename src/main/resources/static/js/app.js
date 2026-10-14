import { SECTIONS } from './config.js';
import { h, icon, errorState } from './ui.js';

const STORE_NAME = 'Mi tienda';

const views = {
  inicio: () => import('./views/home.js'),
  articulos: () => import('./views/articles.js'),
  clientes: () => import('./views/customers.js'),
  ventas: () => import('./views/sales.js'),
  facturas: () => import('./views/invoices.js'),
  deudas: () => import('./views/debts.js'),
  abonos: () => import('./views/payments.js'),
  reportes: () => import('./views/reports.js'),
};

const nav = document.getElementById('nav');
const view = document.getElementById('view');
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const menuBtn = document.getElementById('menu-btn');

menuBtn.append(icon('menu', 22));
nav.append(...SECTIONS.map((s) =>
  h('a', { class: 'nav-link', href: `#/${s.path}`, dataset: { path: s.path } }, icon(s.icon), s.label),
));

function setMenu(open) {
  sidebar.classList.toggle('open', open);
  scrim.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
scrim.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

function currentPath() {
  const path = location.hash.replace(/^#\/?/, '').split('/')[0];
  return views[path] ? path : 'inicio';
}

let navigation = 0;

async function navigate() {
  const path = currentPath();
  const token = ++navigation;
  const section = SECTIONS.find((s) => s.path === path);

  nav.querySelectorAll('.nav-link').forEach((link) => {
    const active = link.dataset.path === path;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${section.label} | ${STORE_NAME}`;
  setMenu(false);

  const root = h('div');
  view.replaceChildren(root);
  try {
    const module = await views[path]();
    if (token !== navigation) return;
    await module.render(root);
  } catch (err) {
    if (token === navigation) root.replaceChildren(errorState(err, navigate));
  }
  if (token === navigation) {
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', navigate);
navigate();
