import { pageHeader, emptyState } from '../ui.js';

// TODO: se implementará cuando se desarrollen los endpoints de reportes.
export async function render(root) {
  root.append(
    pageHeader('Reportes', 'Indicadores y balances de la tienda'),
    emptyState({
      title: 'Los reportes llegarán más adelante',
      text: 'Esta sección queda reservada futuras funcionalidades!!',
    }),
  );
}
