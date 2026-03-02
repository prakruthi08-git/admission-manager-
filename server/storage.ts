import { db, hasDatabase } from "./db";
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
  private get client() {
    if (!db) {
      throw new Error("Database is not configured");
    }
    return db;
  }

  async getInstitutions(): Promise<Institution[]> { return await this.client.select().from(institutions); }
  async createInstitution(inst: InsertInstitution): Promise<Institution> {
    const [res] = await this.client.insert(institutions).values(inst).returning();
    return res;
  }
  
  async getCampuses(): Promise<Campus[]> { return await this.client.select().from(campuses); }
  async createCampus(campus: InsertCampus): Promise<Campus> {
    const [res] = await this.client.insert(campuses).values(campus).returning();
    return res;
  }

  async getDepartments(): Promise<Department[]> { return await this.client.select().from(departments); }
  async createDepartment(dept: InsertDepartment): Promise<Department> {
    const [res] = await this.client.insert(departments).values(dept).returning();
    return res;
  }

  async getPrograms(): Promise<Program[]> { return await this.client.select().from(programs); }
  async createProgram(prog: InsertProgram): Promise<Program> {
    const [res] = await this.client.insert(programs).values(prog).returning();
    return res;
  }

  async getQuotas(): Promise<Quota[]> { return await this.client.select().from(quotas); }
  async createQuota(quota: InsertQuota): Promise<Quota> {
    const [res] = await this.client.insert(quotas).values(quota).returning();
    return res;
  }

  async getApplicants(): Promise<Applicant[]> { return await this.client.select().from(applicants); }
  async createApplicant(app: InsertApplicant): Promise<Applicant> {
    const [res] = await this.client.insert(applicants).values(app).returning();
    return res;
  }
  async updateApplicant(id: number, updates: UpdateApplicantRequest): Promise<Applicant> {
    const [res] = await this.client.update(applicants).set(updates).where(eq(applicants.id, id)).returning();
    return res;
  }

  async getAdmissions(): Promise<Admission[]> { return await this.client.select().from(admissions); }
  async createAdmission(admission: InsertAdmission): Promise<Admission> {
    const [res] = await this.client.insert(admissions).values(admission).returning();
    return res;
  }
  async updateAdmission(id: number, updates: UpdateAdmissionRequest): Promise<Admission> {
    const [res] = await this.client.update(admissions).set(updates).where(eq(admissions.id, id)).returning();
    return res;
  }
}

export class MemoryStorage implements IStorage {
  private institutionId = 1;
  private campusId = 1;
  private departmentId = 1;
  private programId = 1;
  private quotaId = 1;
  private applicantId = 1;
  private admissionId = 1;

  private institutionsData: Institution[] = [];
  private campusesData: Campus[] = [];
  private departmentsData: Department[] = [];
  private programsData: Program[] = [];
  private quotasData: Quota[] = [];
  private applicantsData: Applicant[] = [];
  private admissionsData: Admission[] = [];

  async getInstitutions(): Promise<Institution[]> {
    return this.institutionsData;
  }

  async createInstitution(inst: InsertInstitution): Promise<Institution> {
    const res: Institution = { id: this.institutionId++, ...inst };
    this.institutionsData.push(res);
    return res;
  }

  async getCampuses(): Promise<Campus[]> {
    return this.campusesData;
  }

  async createCampus(campus: InsertCampus): Promise<Campus> {
    const res: Campus = { id: this.campusId++, ...campus };
    this.campusesData.push(res);
    return res;
  }

  async getDepartments(): Promise<Department[]> {
    return this.departmentsData;
  }

  async createDepartment(dept: InsertDepartment): Promise<Department> {
    const res: Department = { id: this.departmentId++, ...dept };
    this.departmentsData.push(res);
    return res;
  }

  async getPrograms(): Promise<Program[]> {
    return this.programsData;
  }

  async createProgram(prog: InsertProgram): Promise<Program> {
    const res: Program = { id: this.programId++, ...prog };
    this.programsData.push(res);
    return res;
  }

  async getQuotas(): Promise<Quota[]> {
    return this.quotasData;
  }

  async createQuota(quota: InsertQuota): Promise<Quota> {
    const res: Quota = { id: this.quotaId++, ...quota };
    this.quotasData.push(res);
    return res;
  }

  async getApplicants(): Promise<Applicant[]> {
    return this.applicantsData;
  }

  async createApplicant(app: InsertApplicant): Promise<Applicant> {
    const res: Applicant = {
      id: this.applicantId++,
      documentStatus: "Pending",
      ...app,
    };
    this.applicantsData.push(res);
    return res;
  }

  async updateApplicant(id: number, updates: UpdateApplicantRequest): Promise<Applicant> {
    const index = this.applicantsData.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Applicant not found");
    }

    const res: Applicant = { ...this.applicantsData[index], ...updates, id };
    this.applicantsData[index] = res;
    return res;
  }

  async getAdmissions(): Promise<Admission[]> {
    return this.admissionsData;
  }

  async createAdmission(admission: InsertAdmission): Promise<Admission> {
    const { allotmentNumber, ...rest } = admission;
    const res: Admission = {
      id: this.admissionId++,
      feeStatus: "Pending",
      status: "Allocated",
      admissionNumber: null,
      allotmentNumber: allotmentNumber ?? null,
      ...rest,
    };
    this.admissionsData.push(res);
    return res;
  }

  async updateAdmission(id: number, updates: UpdateAdmissionRequest): Promise<Admission> {
    const index = this.admissionsData.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Admission not found");
    }

    const res: Admission = { ...this.admissionsData[index], ...updates, id };
    this.admissionsData[index] = res;
    return res;
  }
}

export const storage: IStorage = hasDatabase ? new DatabaseStorage() : new MemoryStorage();
