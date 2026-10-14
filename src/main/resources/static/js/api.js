const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const DEFAULT_MESSAGES = {
  400: 'La solicitud no es válida. Revisa los datos ingresados.',
  401: 'Necesitas iniciar sesión para continuar.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  405: 'El servidor no expone esta operación. Revisa que el endpoint exista en el controller.',
  409: 'La operación entra en conflicto con el estado actual de los datos.',
  500: 'El servidor tuvo un problema al procesar la solicitud.',
};

async function buildError(res) {
  let message = '';
  try {
    const data = await res.clone().json();
    message = data.message || data.detail || '';
  } catch {
  }
  return new ApiError(message || DEFAULT_MESSAGES[res.status] || `Error ${res.status}`, res.status);
}

async function request(path, { method = 'GET', body } = {}) {
  const hasBody = body !== undefined;
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : {},
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica que la aplicación esté corriendo.');
  }

  if (!res.ok) throw await buildError(res);
  if (res.status === 204) return null;

  const type = res.headers.get('content-type') || '';
  return type.includes('application/json') ? res.json() : null;
}

export const articlesApi = {
  list: () => request('/articles'),
  get: (id) => request(`/articles/${id}`),
  create: (article) => request('/articles', { method: 'POST', body: article }),
  remove: (id) => request(`/articles/${id}`, { method: 'DELETE' }), // requiere @DeleteMapping("/{id}")
  intake: (id, quantity) => request(`/articles/${id}/intake`, { method: 'PATCH', body: { quantity } }),
  outflow: (id, quantity) => request(`/articles/${id}/outflow`, { method: 'PATCH', body: { quantity } }),
};

export const customersApi = {
  list: () => request('/customers'),
  get: (id) => request(`/customers/${id}`),
  getByDocument: (document) => request(`/customers/document/${encodeURIComponent(document)}`),
  debtWarning: (document) => request(`/customers/${encodeURIComponent(document)}/debt-warning`), // { customerDocument, hasHighDebt, message }
  create: (customer) => request('/customers', { method: 'POST', body: customer }),
  remove: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  removeByDocument: (document) => request(`/customers/document/${encodeURIComponent(document)}`, { method: 'DELETE' }),
};

export const salesApi = {
  list: () => request('/sales'),
  get: (id) => request(`/sales/${id}`),
  create: ({ type, customerDocument, items }) =>
    request('/sales', { method: 'POST', body: { type, customerDocument, items } }),
};

export const debtsApi = {
  list: () => request('/debts'),
  get: (id) => request(`/debts/${id}`),
};

export const paymentsApi = {
  list: () => request('/payments'),
  get: (id) => request(`/payments/${id}`),
  create: ({ amount, debtId }) => request('/payments', { method: 'POST', body: { amount, debtId } }),
};
