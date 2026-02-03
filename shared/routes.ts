import { z } from 'zod';
import { insertRegistrationSchema, registrations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  generateCard: {
    method: 'POST' as const,
    path: '/api/generate-card',
    // Input is technically multipart/form-data, so we don't strictly enforce a JSON body schema here
    // But we use the Zod schema for field validation on the server
    responses: {
      200: z.any(), // Blob/File response
      400: errorSchemas.validation,
      500: errorSchemas.internal,
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
