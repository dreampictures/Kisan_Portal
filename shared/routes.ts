import { z } from 'zod';
import { insertRegistrationSchema, registrations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  registrations: {
    submit: {
      method: 'POST' as const,
      path: '/api/registrations',
      responses: {
        201: z.object({ message: z.string(), id: z.number() }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/admin/registrations',
      responses: {
        200: z.array(z.custom<typeof registrations.$inferSelect>()),
        401: z.object({ message: z.string() }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/registrations/:id',
      responses: {
        200: z.custom<typeof registrations.$inferSelect>(),
        401: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/registrations/:id',
      responses: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    downloadAll: {
      method: 'GET' as const,
      path: '/api/admin/registrations/download',
      responses: {
        200: z.any(), // CSV/ZIP blob
        401: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
