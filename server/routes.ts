import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Auto-initialize default institution and campus on first request
  async function ensureDefaultSetup() {
    const institutions = await storage.getInstitutions();
    if (institutions.length === 0) {
      const inst = await storage.createInstitution({ name: "My Institution", code: "INST" });
      await storage.createCampus({ name: "Main Campus", institutionId: inst.id });
    }
  }

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

    const pendingDocuments = allApplicants.filter((a) => a.documentStatus !== "Verified").length;
    const pendingFeeList = allAdmissions
      .filter((a) => a.feeStatus === "Pending")
      .map((a) => ({
        admissionId: a.id,
        applicantId: a.applicantId,
        programId: a.programId,
        quotaType: a.quotaType,
      }));
    const pendingFees = pendingFeeList.length;

    res.status(200).json({
      programsIntake,
      quotaStats,
      pendingDocuments,
      pendingFees,
      pendingFeeList,
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

      const allPrograms = await storage.getPrograms();
      const program = allPrograms.find((p) => p.id === input.programId);
      if (!program) {
        return res.status(404).json({ message: "Program not found." });
      }

      const existingQuotas = (await storage.getQuotas()).filter(
        (q) => q.programId === input.programId,
      );
      if (existingQuotas.some((q) => q.quotaType === input.quotaType)) {
        return res
          .status(409)
          .json({ message: "Quota type already exists for this program." });
      }

      const currentTotal = existingQuotas.reduce((sum, q) => sum + q.seatCount, 0);
      if (currentTotal + input.seatCount > program.totalIntake) {
        return res.status(400).json({
          message:
            "Quota seats exceed total intake for this program. Adjust seat counts.",
        });
      }

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

      const allPrograms = await storage.getPrograms();
      const program = allPrograms.find((p) => p.id === input.programId);
      if (!program) {
        return res.status(404).json({ message: "Program not found." });
      }

      const allApplicants = await storage.getApplicants();
      const applicant = allApplicants.find((a) => a.id === input.applicantId);
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found." });
      }
      
      // Validation: Check Quota Availability
      const quotas = await storage.getQuotas();
      const quota = quotas.find(q => q.programId === input.programId && q.quotaType === input.quotaType);
      
      if (!quota) {
        return res.status(400).json({ message: "Invalid quota type for this program." });
      }

      const programQuotaTotal = quotas
        .filter((q) => q.programId === input.programId)
        .reduce((sum, q) => sum + q.seatCount, 0);
      if (programQuotaTotal !== program.totalIntake) {
        return res.status(400).json({
          message:
            "Program quotas are not balanced with intake. Total quota seats must equal intake before allocation.",
        });
      }

      if (
        (input.quotaType === "KCET" || input.quotaType === "COMEDK") &&
        !input.allotmentNumber
      ) {
        return res.status(400).json({
          message: "Allotment number is required for KCET and COMEDK admissions.",
        });
      }

      const allAdmissions = await storage.getAdmissions();
      const existingApplicantAdmission = allAdmissions.find(
        (a) => a.applicantId === input.applicantId && a.status !== "Cancelled",
      );
      if (existingApplicantAdmission) {
        return res
          .status(409)
          .json({ message: "Applicant already has an allocated seat." });
      }

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
      if (admission.admissionNumber) return res.status(400).json({ message: "Admission number is immutable and already generated." });

      const allPrograms = await storage.getPrograms();
      const program = allPrograms.find((p) => p.id === admission.programId);
      if (!program) return res.status(404).json({ message: "Program not found for this admission." });

      // Generate admission number
      const currentYear = new Date().getFullYear();
      const programCode = buildProgramCode(program.name);
      const admissionNumber = `INST/${currentYear}/${program.courseType}/${programCode}/${admission.quotaType.toUpperCase()}/${id.toString().padStart(4, '0')}`;

      const updated = await storage.updateAdmission(id, { status: 'Confirmed', admissionNumber });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // seedDatabase().catch(console.error); // Disabled - no dummy data

  return httpServer;
}

function buildProgramCode(programName: string): string {
  const words = programName
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(" ")
    .map((w) => w.trim())
    .filter(Boolean);

  const joined = words
    .filter((w) => w.length > 2 || /^[A-Z0-9]+$/.test(w))
    .slice(0, 3)
    .map((w) => w.toUpperCase());

  if (joined.length === 0) {
    return "GEN";
  }
  return joined.join("").slice(0, 6);
}

async function seedDatabase() {
  const existingInst = await storage.getInstitutions();
  if (existingInst.length === 0) {
    const inst = await storage.createInstitution({ name: "Global Engineering College", code: "GEC" });
    const campus = await storage.createCampus({ name: "Main Campus", institutionId: inst.id });
    const dept = await storage.createDepartment({ name: "Computer Science", code: "CSE", campusId: campus.id });
    
    const prog = await storage.createProgram({
      name: "B.Tech CSE",
      code: "BTCSE",
      departmentId: dept.id,
      courseType: "UG",
      entryType: "Regular",
      academicYear: "2026-2027",
      totalIntake: 120
    });

    await storage.createQuota({ programId: prog.id, quotaType: "KCET", seatCount: 60 });
    await storage.createQuota({ programId: prog.id, quotaType: "COMEDK", seatCount: 30 });
    await storage.createQuota({ programId: prog.id, quotaType: "Management", seatCount: 30 });

    const applicant1 = await storage.createApplicant({
      fullName: "Alice Smith",
      email: "alice@example.com",
      phone: "9876543210",
      dateOfBirth: "2005-05-15",
      gender: "Female",
      category: "GM",
      entryType: "Regular",
      qualifyingExam: "KCET",
      marks: "95%",
      fatherName: "John Smith",
      motherName: "Mary Smith",
      address: "123 Main St",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
    });
    
    const applicant2 = await storage.createApplicant({
      fullName: "Bob Jones",
      email: "bob@example.com",
      phone: "9876543211",
      dateOfBirth: "2005-08-20",
      gender: "Male",
      category: "SC",
      entryType: "Regular",
      qualifyingExam: "Management",
      marks: "82%",
      fatherName: "Robert Jones",
      motherName: "Linda Jones",
      address: "456 Park Ave",
      city: "Mysore",
      state: "Karnataka",
      pincode: "570001",
    });

    await storage.createAdmission({
      applicantId: applicant1.id,
      programId: prog.id,
      quotaType: "KCET",
      allotmentNumber: "AL-59302"
    });
  }
}
