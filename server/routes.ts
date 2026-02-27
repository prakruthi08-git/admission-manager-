import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Dashboard Stats
  app.get(api.dashboard.stats.path, async (req, res) => {
    const allPrograms = await storage.getPrograms();
    const allAdmissions = await storage.getAdmissions();
    const allApplicants = await storage.getApplicants();
    const allQuotas = await storage.getQuotas();

    const programsIntake = allPrograms.map(p => {
      const admitted = allAdmissions.filter(a => a.programId === p.id && a.status === 'Confirmed').length;
      return { program: p.name, intake: p.totalIntake, admitted };
    });

    // Aggregate by quota type
    const quotaMap: Record<string, { filled: number, total: number }> = {};
    allQuotas.forEach(q => {
      if (!quotaMap[q.quotaType]) {
        quotaMap[q.quotaType] = { filled: 0, total: 0 };
      }
      quotaMap[q.quotaType].total += q.seatCount;
    });

    allAdmissions.forEach(a => {
      if (a.status === 'Confirmed') {
        if (!quotaMap[a.quotaType]) {
          quotaMap[a.quotaType] = { filled: 0, total: 0 };
        }
        quotaMap[a.quotaType].filled += 1;
      }
    });

    const quotaStats = Object.entries(quotaMap).map(([quotaType, stats]) => ({
      quotaType,
      filled: stats.filled,
      remaining: stats.total - stats.filled
    }));

    const pendingDocuments = allApplicants.filter(a => a.documentStatus === 'Pending').length;
    const pendingFees = allAdmissions.filter(a => a.feeStatus === 'Pending').length;

    res.status(200).json({
      programsIntake,
      quotaStats,
      pendingDocuments,
      pendingFees
    });
  });

  // Institutions
  app.get(api.institutions.list.path, async (req, res) => {
    res.json(await storage.getInstitutions());
  });
  app.post(api.institutions.create.path, async (req, res) => {
    try {
      const input = api.institutions.create.input.parse(req.body);
      res.status(201).json(await storage.createInstitution(input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // Campuses
  app.get(api.campuses.list.path, async (req, res) => res.json(await storage.getCampuses()));
  app.post(api.campuses.create.path, async (req, res) => {
    try {
      const input = api.campuses.create.input.extend({ institutionId: z.coerce.number() }).parse(req.body);
      res.status(201).json(await storage.createCampus(input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // Departments
  app.get(api.departments.list.path, async (req, res) => res.json(await storage.getDepartments()));
  app.post(api.departments.create.path, async (req, res) => {
    try {
      const input = api.departments.create.input.extend({ campusId: z.coerce.number() }).parse(req.body);
      res.status(201).json(await storage.createDepartment(input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // Programs
  app.get(api.programs.list.path, async (req, res) => res.json(await storage.getPrograms()));
  app.post(api.programs.create.path, async (req, res) => {
    try {
      const input = api.programs.create.input.extend({
        departmentId: z.coerce.number(),
        totalIntake: z.coerce.number(),
      }).parse(req.body);
      res.status(201).json(await storage.createProgram(input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // Quotas
  app.get(api.quotas.list.path, async (req, res) => res.json(await storage.getQuotas()));
  app.post(api.quotas.create.path, async (req, res) => {
    try {
      const input = api.quotas.create.input.extend({
        programId: z.coerce.number(),
        seatCount: z.coerce.number(),
      }).parse(req.body);
      res.status(201).json(await storage.createQuota(input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // Applicants
  app.get(api.applicants.list.path, async (req, res) => res.json(await storage.getApplicants()));
  app.post(api.applicants.create.path, async (req, res) => {
    try {
      const input = api.applicants.create.input.parse(req.body);
      res.status(201).json(await storage.createApplicant(input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });
  app.put(api.applicants.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.applicants.update.input.parse(req.body);
      res.status(200).json(await storage.updateApplicant(id, input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  // Admissions
  app.get(api.admissions.list.path, async (req, res) => res.json(await storage.getAdmissions()));
  app.post(api.admissions.create.path, async (req, res) => {
    try {
      const input = api.admissions.create.input.extend({
        applicantId: z.coerce.number(),
        programId: z.coerce.number(),
      }).parse(req.body);
      
      // Validation: Check Quota Availability
      const quotas = await storage.getQuotas();
      const quota = quotas.find(q => q.programId === input.programId && q.quotaType === input.quotaType);
      
      if (!quota) {
        return res.status(400).json({ message: "Invalid quota type for this program." });
      }

      const allAdmissions = await storage.getAdmissions();
      const filledSeats = allAdmissions.filter(a => a.programId === input.programId && a.quotaType === input.quotaType && a.status !== 'Cancelled').length;

      if (filledSeats >= quota.seatCount) {
        return res.status(409).json({ message: "Quota is full. Cannot allocate seat." });
      }

      res.status(201).json(await storage.createAdmission(input));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  app.patch(api.admissions.updateFee.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.admissions.updateFee.input.parse(req.body);
      res.status(200).json(await storage.updateAdmission(id, { feeStatus: input.feeStatus }));
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else throw err;
    }
  });

  app.post(api.admissions.confirm.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allAdmissions = await storage.getAdmissions();
      const admission = allAdmissions.find(a => a.id === id);
      
      if (!admission) return res.status(404).json({ message: "Admission not found." });
      if (admission.feeStatus !== 'Paid') return res.status(400).json({ message: "Fee must be paid to confirm admission." });
      if (admission.status === 'Confirmed') return res.status(400).json({ message: "Admission is already confirmed." });

      // Generate admission number
      const currentYear = new Date().getFullYear();
      const admissionNumber = `INST/${currentYear}/UG/CSE/${admission.quotaType.toUpperCase()}/${id.toString().padStart(4, '0')}`;

      const updated = await storage.updateAdmission(id, { status: 'Confirmed', admissionNumber });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingInst = await storage.getInstitutions();
  if (existingInst.length === 0) {
    const inst = await storage.createInstitution({ name: "Global Engineering College" });
    const campus = await storage.createCampus({ name: "Main Campus", institutionId: inst.id });
    const dept = await storage.createDepartment({ name: "Computer Science", campusId: campus.id });
    
    const prog = await storage.createProgram({
      name: "B.Tech CSE",
      departmentId: dept.id,
      courseType: "UG",
      entryType: "Regular",
      admissionMode: "Government",
      academicYear: "2026-2027",
      totalIntake: 120
    });

    await storage.createQuota({ programId: prog.id, quotaType: "KCET", seatCount: 60 });
    await storage.createQuota({ programId: prog.id, quotaType: "COMEDK", seatCount: 30 });
    await storage.createQuota({ programId: prog.id, quotaType: "Management", seatCount: 30 });

    const applicant1 = await storage.createApplicant({
      fullName: "Alice Smith",
      category: "GM",
      entryType: "Regular",
      admissionMode: "Government",
      marks: "95%",
    });
    
    const applicant2 = await storage.createApplicant({
      fullName: "Bob Jones",
      category: "SC",
      entryType: "Regular",
      admissionMode: "Management",
      marks: "82%",
    });

    await storage.createAdmission({
      applicantId: applicant1.id,
      programId: prog.id,
      quotaType: "KCET",
      allotmentNumber: "AL-59302"
    });
  }
}