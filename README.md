# 🎓 Admission Management System

A comprehensive web-based admission management system for educational institutions to streamline the entire admission process from applicant registration to seat confirmation.

## ✨ Features

### 📊 Dashboard Analytics
- Real-time admission statistics and metrics
- Program-wise intake vs admitted visualization
- Quota distribution tracking (KCET, COMEDK, Management)
- Pending documents and fees monitoring
- Fill rate tracking with progress indicators

### 🏛️ Master Setup
- **Institutions**: Manage institution details
- **Campuses**: Multi-campus support
- **Departments**: Department configuration
- **Programs**: Course programs with intake capacity
- **Quotas**: Seat matrix management with quota types

### 👥 Applicant Management
- Complete applicant profile with 15+ fields
- Document status tracking (Pending → Submitted → Verified)
- File upload for 10th and 12th marks cards
- Document verification workflow
- Search and filter capabilities

### 🎫 Admission Processing
- Seat allocation with quota management
- Real-time seat availability checking
- Government quota allotment number tracking
- Fee status management (Pending/Paid)
- Admission confirmation with auto-generated admission numbers
- One seat per applicant validation

### 🔐 Role-Based Access Control
- **Admin**: Full system configuration access
- **Admission Officer**: Applicant and admission management
- **Management**: View-only dashboard access

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching
- **Shadcn/ui** + Tailwind CSS for UI components
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **Zod** for validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/prakruthi08-git/admission-manager.git
cd admission-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/admission_db
PORT=5000
```

4. **Set up the database**
```bash
# Create database
createdb admission_db

# Run database setup script
psql -U username -d admission_db -f setup_database.sql
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📖 Usage Guide

### Initial Setup

1. **Create Institution**
   - Go to Master Setup → Institutions
   - Add your institution details (Name, Code)

2. **Add Campus**
   - Go to Master Setup → Campuses
   - Create campus and link to institution

3. **Create Departments**
   - Go to Master Setup → Departments
   - Add departments with codes (e.g., CSE, ECE, MECH)

4. **Configure Programs**
   - Go to Master Setup → Programs
   - Create programs with:
     - Name (e.g., B.Tech CSE)
     - Course Type (UG/PG)
     - Entry Type (Regular/Lateral)
     - Total Intake capacity

5. **Define Quotas**
   - Go to Master Setup → Quotas
   - Set seat distribution:
     - KCET: Government quota
     - COMEDK: Consortium quota
     - Management: Institution quota
   - Ensure total quota seats = program intake

### Admission Workflow

#### Step 1: Register Applicant
- Navigate to Applicants page
- Click "Add Applicant"
- Fill all required fields (15 fields)
- Save applicant profile

#### Step 2: Allocate Seat
- Go to Admissions page
- Click "Allocate Seat"
- Select applicant, program, and quota type
- Enter allotment number (for KCET/COMEDK)
- System validates:
  - Seat availability
  - No duplicate admission
  - Quota balance

#### Step 3: Document Verification
- Go to Applicants page
- Upload 10th and 12th marks cards
- Update document status to "Verified"

#### Step 4: Fee Payment
- Go to Admissions page
- Click "Mark Paid" for the admission
- Fee status changes to "Paid"

#### Step 5: Confirm Admission
- Click "Confirm" button (enabled after fee paid)
- System generates unique admission number
- Format: `INST/2026/UG/CSE/KCET/0001`
- Status changes to "Confirmed"

## 🔒 Business Rules

| Rule | Description |
|------|-------------|
| Quota Balance | Sum of all quota seats must equal program intake |
| Seat Availability | Cannot allocate if quota is full |
| One Seat Per Applicant | Each applicant can have only one active admission |
| Allotment Number | Mandatory for KCET and COMEDK quotas |
| Fee Before Confirmation | Fee must be paid before confirming admission |
| Immutable Admission Number | Once generated, cannot be changed |

## 📁 Project Structure

```
admission-manager/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and context
│   │   └── pages/         # Page components
├── server/                # Backend Express application
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   └── storage.ts        # Database operations
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Database schema
│   └── routes.ts         # API definitions
├── setup_database.sql    # Database setup script
└── clear_data.sql        # Data cleanup script
```

## 🗄️ Database Schema

### Core Tables
- **institutions**: Institution details
- **campuses**: Campus information
- **departments**: Department configuration
- **programs**: Academic programs
- **quotas**: Seat matrix and quota types
- **applicants**: Applicant profiles
- **admissions**: Admission records

### Relationships
```
institutions (1) → (N) campuses
campuses (1) → (N) departments
departments (1) → (N) programs
programs (1) → (N) quotas
programs (1) → (N) admissions
applicants (1) → (N) admissions
```

## 🔌 API Endpoints

### Master Setup
- `GET /api/institutions` - List all institutions
- `POST /api/institutions` - Create institution
- `GET /api/campuses` - List all campuses
- `POST /api/campuses` - Create campus
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department
- `GET /api/programs` - List all programs
- `POST /api/programs` - Create program
- `GET /api/quotas` - List all quotas
- `POST /api/quotas` - Create quota

### Applicants
- `GET /api/applicants` - List all applicants
- `POST /api/applicants` - Create applicant
- `PUT /api/applicants/:id` - Update applicant

### Admissions
- `GET /api/admissions` - List all admissions
- `POST /api/admissions` - Allocate seat
- `PATCH /api/admissions/:id/fee` - Update fee status
- `POST /api/admissions/:id/confirm` - Confirm admission

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Clear all data (use with caution)
psql -U username -d admission_db -f clear_data.sql
```

## 📝 Documentation

- [FEATURES_IMPLEMENTATION.md](./FEATURES_IMPLEMENTATION.md) - Detailed feature documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide
- [ADMISSION_OFFICER_FEATURES_VERIFIED.md](./ADMISSION_OFFICER_FEATURES_VERIFIED.md) - Feature verification
- [QUOTA_MANAGEMENT_VERIFIED.md](./QUOTA_MANAGEMENT_VERIFIED.md) - Quota management guide

