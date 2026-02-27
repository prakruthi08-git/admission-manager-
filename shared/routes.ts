import { z } from 'zod';
import { 
  insertInstitutionSchema, institutions,
  insertCampusSchema, campuses,
  insertDepartmentSchema, departments,
  insertProgramSchema, programs,
  insertQuotaSchema, quotas,
  insertApplicantSchema, applicants,
  insertAdmissionSchema, admissions
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  conflict: z.object({ message: z.string() }), // For seat overbooking
};

export const api = {
  institutions: {
    list: { method: 'GET' as const, path: '/api/institutions' as const, responses: { 200: z.array(z.custom<typeof institutions.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/institutions' as const, input: insertInstitutionSchema, responses: { 201: z.custom<typeof institutions.$inferSelect>(), 400: errorSchemas.validation } },
  },
  campuses: {
    list: { method: 'GET' as const, path: '/api/campuses' as const, responses: { 200: z.array(z.custom<typeof campuses.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/campuses' as const, input: insertCampusSchema, responses: { 201: z.custom<typeof campuses.$inferSelect>(), 400: errorSchemas.validation } },
  },
  departments: {
    list: { method: 'GET' as const, path: '/api/departments' as const, responses: { 200: z.array(z.custom<typeof departments.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/departments' as const, input: insertDepartmentSchema, responses: { 201: z.custom<typeof departments.$inferSelect>(), 400: errorSchemas.validation } },
  },
  programs: {
    list: { method: 'GET' as const, path: '/api/programs' as const, responses: { 200: z.array(z.custom<typeof programs.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/programs' as const, input: insertProgramSchema, responses: { 201: z.custom<typeof programs.$inferSelect>(), 400: errorSchemas.validation } },
  },
  quotas: {
    list: { method: 'GET' as const, path: '/api/quotas' as const, responses: { 200: z.array(z.custom<typeof quotas.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/quotas' as const, input: insertQuotaSchema, responses: { 201: z.custom<typeof quotas.$inferSelect>(), 400: errorSchemas.validation } },
  },
  applicants: {
    list: { method: 'GET' as const, path: '/api/applicants' as const, responses: { 200: z.array(z.custom<typeof applicants.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/applicants' as const, input: insertApplicantSchema, responses: { 201: z.custom<typeof applicants.$inferSelect>(), 400: errorSchemas.validation } },
    update: { 
      method: 'PUT' as const, 
      path: '/api/applicants/:id' as const, 
      input: z.object({ documentStatus: z.string() }), 
      responses: { 200: z.custom<typeof applicants.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound } 
    },
  },
  admissions: {
    list: { method: 'GET' as const, path: '/api/admissions' as const, responses: { 200: z.array(z.custom<typeof admissions.$inferSelect>()) } },
    create: { 
      method: 'POST' as const, 
      path: '/api/admissions' as const, 
      input: insertAdmissionSchema, 
      responses: { 201: z.custom<typeof admissions.$inferSelect>(), 400: errorSchemas.validation, 409: errorSchemas.conflict } 
    },
    confirm: {
      method: 'POST' as const,
      path: '/api/admissions/:id/confirm' as const,
      responses: { 200: z.custom<typeof admissions.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound }
    },
    updateFee: {
      method: 'PATCH' as const,
      path: '/api/admissions/:id/fee' as const,
      input: z.object({ feeStatus: z.string() }),
      responses: { 200: z.custom<typeof admissions.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound }
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          programsIntake: z.array(z.any()), // { program: string, intake: number, admitted: number }
          quotaStats: z.array(z.any()), // { quotaType: string, filled: number, remaining: number }
          pendingDocuments: z.number(),
          pendingFees: z.number()
        })
      }
    }
  }
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