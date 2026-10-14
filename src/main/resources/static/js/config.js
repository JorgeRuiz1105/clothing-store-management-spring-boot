export const LOCALE = 'es-CO';
export const CURRENCY = 'COP';

// Un artículo con esta cantidad o menos se marca como "stock bajo".
export const LOW_STOCK_THRESHOLD = 3;

export const CATEGORIES = {
  ROPA: {
    label: 'Ropa',
    sizes: [
      'XS', 'S', 'M', 'L', 'XL', 'XXL',
      '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40',
    ],
  },
  CALZADO: {
    label: 'Calzado',
    sizes: Array.from({ length: 34 }, (_, i) => String(15 + i)), // 15 a 48
  },
  BEBES: {
    label: 'Bebés',
    sizes: ['0-3M', '3-6M', '6-12M', '2T', '4T'],
  },
};

export const SALE_TYPES = {
  CONTADO: { label: 'Contado', hint: 'Pago completo al momento de la venta.' },
  FIADA: { label: 'Fiada', hint: 'Se registrará una deuda a nombre del cliente.' },
};

export const DEBT_STATES = {
  PENDIENTE: { label: 'Pendiente' },
  PAGADA: { label: 'Pagada' },
};

export const SECTIONS = [
  { path: 'inicio', label: 'Inicio', icon: 'home', description: 'Resumen del inventario y accesos rápidos' },
  { path: 'articulos', label: 'Artículos', icon: 'box', description: 'Inventario, precios y movimientos de stock' },
  { path: 'clientes', label: 'Clientes', icon: 'users', description: 'Registro de clientes para ventas y créditos' },
  { path: 'ventas', label: 'Ventas', icon: 'cart', description: 'Carrito y cobro de una nueva venta' },
  { path: 'facturas', label: 'Facturas', icon: 'receipt', description: 'Historial de ventas realizadas' },
  { path: 'deudas', label: 'Deudas', icon: 'book', description: 'Saldos pendientes de las ventas fiadas' },
  { path: 'abonos', label: 'Abonos', icon: 'wallet', description: 'Pagos registrados a las deudas' },
  { path: 'reportes', label: 'Reportes', icon: 'chart', description: 'Indicadores y balances de la tienda' },
];
