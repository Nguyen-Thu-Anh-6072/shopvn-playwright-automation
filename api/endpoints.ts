/**
 * API paths, taken from /api-docs. Keeping them in one file means a backend
 * change touches a single place instead of every service class.
 */
const prefix = '/api';

export const endpoints = {
  auth: {
    login: `${prefix}/auth/login`,
    register: `${prefix}/auth/register`,
    me: `${prefix}/auth/me`,
  },
  profile: {
    current: `${prefix}/profile`,
  },
  products: {
    list: `${prefix}/products`,
    byId: (id: string) => `${prefix}/products/${id}`,
  },
  orders: {
    list: `${prefix}/orders`,
    create: `${prefix}/orders`,
    byId: (id: string) => `${prefix}/orders/${id}`,
    all: `${prefix}/orders`,
  },
  cart: {
    current: `${prefix}/cart`,
  },
} as const;
