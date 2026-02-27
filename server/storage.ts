import { db } from "./db";
import {
  institutions, campuses, departments, programs, quotas, applicants, admissions,
  type Institution, type InsertInstitution,
  type Campus, type InsertCampus,
  type Department, type InsertDepartment,
  type Program, type InsertProgram,
  type Quota, type InsertQuota,
  type Applicant, type InsertApplicant,
  type Admission, type InsertAdmission,
  type UpdateApplicantRequest,
  type UpdateAdmissionRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Institutions
  getInstitutions(): Promise<Institution[]>;
  createInstitution(inst: InsertInstitution): Promise<Institution>;
  
  // Campuses
  getCampuses(): Promise<Campus[]>;
  createCampus(campus: InsertCampus): Promise<Campus>;
  
  // Departments
  getDepartments(): Promise<Department[]>;
  createDepartment(dept: InsertDepartment): Promise<Department>;
  
  // Programs
  getPrograms(): Promise<Program[]>;
  createProgram(prog: InsertProgram): Promise<Program>;
  
  // Quotas
  getQuotas(): Promise<Quota[]>;
  createQuota(quota: InsertQuota): Promise<Quota>;
  
  // Applicants
  getApplicants(): Promise<Applicant[]>;
  createApplicant(app: InsertApplicant): Promise<Applicant>;
  updateApplicant(id: number, updates: UpdateApplicantRequest): Promise<Applicant>;
  
  // Admissions
  getAdmissions(): Promise<Admission[]>;
  createAdmission(admission: InsertAdmission): Promise<Admission>;
  updateAdmission(id: number, updates: UpdateAdmissionRequest): Promise<Admission>;
}

export class DatabaseStorage implements IStorage {
  async getInstitutions(): Promise<Institution[]> { return await db.select().from(institutions); }
  async createInstitution(inst: InsertInstitution): Promise<Institution> {
    const [res] = await db.insert(institutions).values(inst).returning();
    return res;
  }
  
  async getCampuses(): Promise<Campus[]> { return await db.select().from(campuses); }
  async createCampus(campus: InsertCampus): Promise<Campus> {
    const [res] = await db.insert(campuses).values(campus).returning();
    return res;
  }

  async getDepartments(): Promise<Department[]> { return await db.select().from(departments); }
  async createDepartment(dept: InsertDepartment): Promise<Department> {
    const [res] = await db.insert(departments).values(dept).returning();
    return res;
  }

  async getPrograms(): Promise<Program[]> { return await db.select().from(programs); }
  async createProgram(prog: InsertProgram): Promise<Program> {
    const [res] = await db.insert(programs).values(prog).returning();
    return res;
  }

  async getQuotas(): Promise<Quota[]> { return await db.select().from(quotas); }
  async createQuota(quota: InsertQuota): Promise<Quota> {
    const [res] = await db.insert(quotas).values(quota).returning();
    return res;
  }

  async getApplicants(): Promise<Applicant[]> { return await db.select().from(applicants); }
  async createApplicant(app: InsertApplicant): Promise<Applicant> {
    const [res] = await db.insert(applicants).values(app).returning();
    return res;
  }
  async updateApplicant(id: number, updates: UpdateApplicantRequest): Promise<Applicant> {
    const [res] = await db.update(applicants).set(updates).where(eq(applicants.id, id)).returning();
    return res;
  }

  async getAdmissions(): Promise<Admission[]> { return await db.select().from(admissions); }
  async createAdmission(admission: InsertAdmission): Promise<Admission> {
    const [res] = await db.insert(admissions).values(admission).returning();
    return res;
  }
  async updateAdmission(id: number, updates: UpdateAdmissionRequest): Promise<Admission> {
    const [res] = await db.update(admissions).set(updates).where(eq(admissions.id, id)).returning();
    return res;
  }
}

export const storage = new DatabaseStorage();