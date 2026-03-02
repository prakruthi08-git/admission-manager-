import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campuses = pgTable("campuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  institutionId: integer("institution_id").notNull().references(() => institutions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  campusId: integer("campus_id").notNull().references(() => campuses.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  courseType: text("course_type").notNull(), // UG / PG
  entryType: text("entry_type").notNull(), // Regular / Lateral
  academicYear: text("academic_year").notNull(),
  totalIntake: integer("total_intake").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotas = pgTable("quotas", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id),
  quotaType: text("quota_type").notNull(), // KCET, COMEDK, Management
  seatCount: integer("seat_count").notNull(),
  filledSeats: integer("filled_seats").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  category: text("category").notNull(), // GM, SC, ST, etc.
  entryType: text("entry_type").notNull(),
  qualifyingExam: text("qualifying_exam").notNull(),
  marks: text("marks").notNull(),
  fatherName: text("father_name").notNull(),
  motherName: text("mother_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  documentStatus: text("document_status").notNull().default('Pending'), // Pending, Submitted, Verified
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicants.id),
  programId: integer("program_id").notNull().references(() => programs.id),
  quotaType: text("quota_type").notNull(), // KCET, COMEDK, Management
  allotmentNumber: text("allotment_number"), // Optional, for Govt
  feeStatus: text("fee_status").notNull().default('Pending'), // Pending, Paid
  admissionNumber: text("admission_number").unique(),
  status: text("status").notNull().default('Allocated'), // Allocated, Confirmed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});

// Zod schemas
export const insertInstitutionSchema = createInsertSchema(institutions).omit({ id: true, createdAt: true });
export const insertCampusSchema = createInsertSchema(campuses).omit({ id: true, createdAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true });
export const insertQuotaSchema = createInsertSchema(quotas).omit({ id: true, filledSeats: true, createdAt: true });
export const insertApplicantSchema = createInsertSchema(applicants).omit({ id: true, documentStatus: true, createdAt: true });
export const insertAdmissionSchema = createInsertSchema(admissions).omit({ id: true, admissionNumber: true, status: true, feeStatus: true, createdAt: true, confirmedAt: true });

// Exports
export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Campus = typeof campuses.$inferSelect;
export type InsertCampus = z.infer<typeof insertCampusSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Quota = typeof quotas.$inferSelect;
export type InsertQuota = z.infer<typeof insertQuotaSchema>;
export type Applicant = typeof applicants.$inferSelect;
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type Admission = typeof admissions.$inferSelect;
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;

export type UpdateApplicantRequest = Partial<InsertApplicant> & { documentStatus?: string };
export type UpdateAdmissionRequest = Partial<InsertAdmission> & {
  feeStatus?: string;
  status?: string;
  admissionNumber?: string | null;
};
