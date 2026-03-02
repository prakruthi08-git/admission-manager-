# Admission Management System - Features & Implementation Guide

## Overview
A web-based admission management system for colleges to manage programs, quotas, applicants, and seat allocation with strict quota validation.

---

## 1. MASTER SETUP

### 1.1 Hierarchical Structure
```
Institution → Campus → Department → Program
```

### 1.2 Database Tables

**Institutions**
- `id`, `name`, `code` (unique), `created_at`
- Example: Global Engineering College (GEC)

**Campuses**
- `id`, `name`, `institution_id` (FK), `created_at`
- Links to parent institution

**Departments**
- `id`, `name`, `code`, `campus_id` (FK), `created_at`
- Example: Computer Science (CSE)

**Programs**
- `id`, `name`, `code`, `department_id` (FK), `created_at`
- `course_type`: UG / PG
- `entry_type`: Regular / Lateral
- `academic_year`: 2026-2027
- `total_intake`: Total seats (e.g., 120)

### 1.3 How to Add
1. Navigate to **Master Setup** page
2. Use tabs: Institutions → Campuses → Departments → Programs
3. Click "Add" button for each level
4. Fill form and save

---

## 2. SEAT MATRIX & QUOTA MANAGEMENT

### 2.1 Quota Types
- **KCET** (Government quota)
- **COMEDK** (Consortium quota)
- **Management** (College quota)
- **Supernumerary** (Extra seats, optional)

### 2.2 Database Schema
```sql
quotas (
  id, program_id, quota_type, 
  seat_count, filled_seats DEFAULT 0
)
```

### 2.3 Business Rules
✅ **Total quota seats MUST equal program intake**
```
Example: Program intake = 120
KCET: 60 + COMEDK: 30 + Management: 30 = 120 ✓
```

✅ **No duplicate quota types per program**

✅ **Real-time seat tracking**
- `filled_seats` auto-calculated from admissions
- Remaining = `seat_count - filled_seats`

### 2.4 Validation Logic (server/routes.ts)
```javascript
// Check quota balance before allocation
const currentTotal = existingQuotas.reduce((sum, q) => sum + q.seatCount, 0);
if (currentTotal + input.seatCount > program.totalIntake) {
  return error("Quota seats exceed total intake");
}
```

---

## 3. APPLICANT MANAGEMENT

### 3.1 15 Required Fields
1. Full Name
2. Email
3. Phone
4. Date of Birth
5. Gender (Male/Female/Other)
6. Category (GM/SC/ST/OBC)
7. Entry Type (Regular/Lateral)
8. Qualifying Exam (KCET/COMEDK/Management)
9. Marks/Percentage
10. Father's Name
11. Mother's Name
12. Address
13. City
14. State
15. Pincode

### 3.2 Document Status Workflow
```
Pending → Submitted → Verified
```

### 3.3 Database Table
```sql
applicants (
  id, full_name, email, phone, date_of_birth,
  gender, category, entry_type, qualifying_exam, marks,
  father_name, mother_name, address, city, state, pincode,
  document_status DEFAULT 'Pending'
)
```

### 3.4 How to Use
1. Go to **Applicants** page
2. Click "Add Applicant"
3. Fill all 15 fields
4. Update document status via dropdown

---

## 4. SEAT ALLOCATION

### 4.1 Two Admission Flows

**Government Flow (KCET/COMEDK)**
1. Create applicant
2. Enter **allotment number** (mandatory)
3. Select program & quota
4. System validates availability
5. Seat locked

**Management Flow**
1. Create applicant
2. Select program & Management quota
3. System validates availability
4. Seat allocated

### 4.2 Critical Validations (server/routes.ts)

```javascript
// 1. Check program exists
if (!program) return 404;

// 2. Check applicant exists
if (!applicant) return 404;

// 3. Validate quota type for program
const quota = quotas.find(q => 
  q.programId === programId && q.quotaType === quotaType
);
if (!quota) return 400;

// 4. Verify quota balance = intake
const programQuotaTotal = quotas
  .filter(q => q.programId === programId)
  .reduce((sum, q) => sum + q.seatCount, 0);
if (programQuotaTotal !== program.totalIntake) {
  return error("Quotas not balanced with intake");
}

// 5. Check allotment number for govt quota
if ((quotaType === "KCET" || quotaType === "COMEDK") && !allotmentNumber) {
  return error("Allotment number required");
}

// 6. Prevent duplicate admission
const existingAdmission = admissions.find(
  a => a.applicantId === applicantId && a.status !== 'Cancelled'
);
if (existingAdmission) {
  return error("Applicant already has allocated seat");
}

// 7. Check seat availability
const filledSeats = admissions.filter(
  a => a.programId === programId && 
       a.quotaType === quotaType && 
       a.status !== 'Cancelled'
).length;

if (filledSeats >= quota.seatCount) {
  return error("Quota is full. Cannot allocate seat");
}
```

### 4.3 Database Table
```sql
admissions (
  id, applicant_id, program_id, quota_type,
  allotment_number, -- Optional for Management
  fee_status DEFAULT 'Pending',
  admission_number UNIQUE, -- Generated on confirmation
  status DEFAULT 'Allocated',
  created_at, confirmed_at
)
```

---

## 5. ADMISSION CONFIRMATION

### 5.1 Workflow
```
Allocated → Fee Paid → Confirmed
```

### 5.2 Admission Number Format
```
INST/2026/UG/CSE/KCET/0001
[Institution]/[Year]/[CourseType]/[ProgramCode]/[Quota]/[ID]
```

### 5.3 Generation Logic (server/routes.ts)
```javascript
const currentYear = new Date().getFullYear();
const programCode = buildProgramCode(program.name); // CSE, ECE, etc.
const admissionNumber = 
  `INST/${currentYear}/${program.courseType}/${programCode}/${quotaType}/${id.toString().padStart(4, '0')}`;
```

### 5.4 Business Rules
✅ **Fee must be paid before confirmation**
```javascript
if (admission.feeStatus !== 'Paid') {
  return error("Fee must be paid to confirm admission");
}
```

✅ **Admission number is immutable**
```javascript
if (admission.admissionNumber) {
  return error("Admission number already generated");
}
```

✅ **Cannot confirm twice**
```javascript
if (admission.status === 'Confirmed') {
  return error("Admission already confirmed");
}
```

### 5.5 How to Confirm
1. Go to **Admissions** page
2. Mark fee as "Paid" (button appears)
3. Click "Confirm" button
4. System generates admission number
5. Status changes to "Confirmed"

---

## 6. FEE STATUS MANAGEMENT

### 6.1 Two States
- **Pending** (default on allocation)
- **Paid** (manually marked by officer)

### 6.2 Implementation
```javascript
// Update fee status
PATCH /api/admissions/:id/fee
Body: { feeStatus: "Paid" }

// Confirmation only allowed when paid
if (admission.feeStatus !== 'Paid') {
  return error("Fee must be paid");
}
```

---

## 7. DASHBOARD ANALYTICS

### 7.1 Key Metrics

**Total Admitted**
- Count of admissions with `status = 'Confirmed'`

**Total Intake Capacity**
- Sum of all `programs.total_intake`

**Pending Documents**
- Count of applicants where `document_status != 'Verified'`

**Pending Fees**
- Count of admissions where `fee_status = 'Pending'`

### 7.2 Visualizations

**Bar Chart: Program-wise Status**
```javascript
data = programs.map(p => ({
  program: p.name,
  intake: p.totalIntake,
  admitted: admissions.filter(a => 
    a.programId === p.id && a.status === 'Confirmed'
  ).length
}));
```

**Pie Chart: Quota Distribution**
```javascript
quotaStats = quotas.map(q => ({
  quotaType: q.quotaType,
  filled: admissions.filter(a => 
    a.quotaType === q.quotaType && a.status === 'Confirmed'
  ).length,
  remaining: q.seatCount - filled
}));
```

**Fee Pending List**
- Shows admission ID, applicant ID, program, quota
- Filterable and sortable

---

## 8. ROLE-BASED ACCESS CONTROL

### 8.1 Three Roles

**Admin**
- Access: Master Setup
- Can: Create institutions, campuses, departments, programs, quotas

**Admission Officer**
- Access: Applicants, Admissions
- Can: Create applicants, allocate seats, verify documents, confirm admissions

**Management (View Only)**
- Access: Dashboard
- Can: View analytics and reports

### 8.2 Implementation
```typescript
// Role context (client/src/lib/role-context.tsx)
const { canManageSetup, canManageAdmissions } = useRole();

// Route protection
if (!canManageAdmissions) return <Redirect to="/" />;
```

---

## 9. KEY SYSTEM RULES (ENFORCED)

| Rule | Implementation | Location |
|------|----------------|----------|
| Quota seats ≤ intake | Validation on quota creation | routes.ts:135-141 |
| No allocation if quota full | Real-time check before admission | routes.ts:228-232 |
| Admission number generated once | Immutability check | routes.ts:263 |
| Confirm only if fee paid | Status validation | routes.ts:260 |
| Seat counters real-time | Dynamic calculation from admissions | routes.ts:228 |
| One seat per applicant | Duplicate check | routes.ts:224-227 |
| Allotment # for govt quota | Mandatory field validation | routes.ts:217-222 |

---

## 10. DATABASE RELATIONSHIPS

```
institutions (1) ──→ (N) campuses
campuses (1) ──→ (N) departments
departments (1) ──→ (N) programs
programs (1) ──→ (N) quotas
programs (1) ──→ (N) admissions
applicants (1) ──→ (N) admissions
```

### Foreign Key Constraints
- All relationships use `REFERENCES` with proper FK constraints
- Ensures referential integrity
- Prevents orphaned records

---

## 11. TECHNOLOGY STACK

**Backend**
- Express.js + TypeScript
- PostgreSQL database
- Drizzle ORM
- Zod validation

**Frontend**
- React + TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Shadcn/ui + Tailwind CSS

**Key Libraries**
- Recharts (dashboard visualizations)
- Lucide React (icons)
- React Hook Form (form handling)

---

## 12. API ENDPOINTS

### Master Setup
```
GET  /api/institutions
POST /api/institutions
GET  /api/campuses
POST /api/campuses
GET  /api/departments
POST /api/departments
GET  /api/programs
POST /api/programs
GET  /api/quotas
POST /api/quotas
```

### Applicants
```
GET  /api/applicants
POST /api/applicants
PUT  /api/applicants/:id
```

### Admissions
```
GET   /api/admissions
POST  /api/admissions
PATCH /api/admissions/:id/fee
POST  /api/admissions/:id/confirm
```

### Dashboard
```
GET /api/dashboard/stats
```

---

## 13. USAGE WORKFLOW

### Complete Admission Journey

**Step 1: System Setup (Admin)**
1. Create Institution (e.g., "Global Engineering College")
2. Add Campus (e.g., "Main Campus")
3. Add Department (e.g., "Computer Science")
4. Create Program (e.g., "B.Tech CSE", Intake: 120)
5. Define Quotas:
   - KCET: 60 seats
   - COMEDK: 30 seats
   - Management: 30 seats
   - Total: 120 ✓

**Step 2: Applicant Registration (Officer)**
1. Go to Applicants page
2. Click "Add Applicant"
3. Fill 15 required fields
4. Save profile

**Step 3: Seat Allocation (Officer)**
1. Go to Admissions page
2. Click "Allocate Seat"
3. Select applicant, program, quota
4. Enter allotment number (if govt quota)
5. System checks:
   - Quota availability ✓
   - No duplicate admission ✓
   - Quota balance ✓
6. Seat allocated (Status: "Allocated")

**Step 4: Document Verification (Officer)**
1. Go to Applicants page
2. Update document status: Pending → Submitted → Verified

**Step 5: Fee Payment (Officer)**
1. Go to Admissions page
2. Click "Mark Paid" button
3. Fee status changes to "Paid"

**Step 6: Admission Confirmation (Officer)**
1. Click "Confirm" button (enabled after fee paid)
2. System generates admission number
3. Status changes to "Confirmed"
4. Admission number displayed (e.g., INST/2026/UG/CSE/KCET/0001)

**Step 7: Monitoring (Management)**
1. View Dashboard
2. Check metrics:
   - Total admitted vs intake
   - Quota-wise distribution
   - Pending documents/fees

---

## 14. ERROR HANDLING

### Common Errors & Solutions

**"Quota seats exceed total intake"**
- Solution: Adjust quota seat counts to match program intake

**"Quota is full. Cannot allocate seat"**
- Solution: Choose different quota or increase quota seats

**"Applicant already has an allocated seat"**
- Solution: One applicant can only have one active admission

**"Allotment number is required"**
- Solution: Enter government allotment number for KCET/COMEDK

**"Fee must be paid to confirm admission"**
- Solution: Mark fee as "Paid" before confirming

**"Quotas not balanced with intake"**
- Solution: Ensure sum of all quota seats = program intake

---

## 15. BEST PRACTICES

✅ **Always balance quotas before allocation**
✅ **Verify documents before fee collection**
✅ **Confirm admission only after fee payment**
✅ **Monitor dashboard regularly for pending items**
✅ **Use unique institution/department codes**
✅ **Keep admission numbers immutable**
✅ **Track all timestamps for audit trail**

---

## 16. OUT OF SCOPE (NOT IMPLEMENTED)

❌ Payment gateway integration
❌ SMS/WhatsApp notifications
❌ Email automation
❌ Advanced CRM features
❌ AI-based predictions
❌ Multi-college management
❌ Marketing automation
❌ Online application portal

---

## Support & Maintenance

For issues or questions:
1. Check error messages in UI
2. Review validation rules above
3. Verify database constraints
4. Check API endpoint responses
5. Review server logs

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready
