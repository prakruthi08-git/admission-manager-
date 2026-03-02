# Database Setup Guide

## Prerequisites
- PostgreSQL installed (version 12 or higher)

## Setup Steps

### 1. Create Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE admission_manager;

# Exit psql
\q
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and update DATABASE_URL
# Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/admission_manager
```

### 3. Run Migrations
```bash
# Generate migration files
npm run db:push

# This will create all tables in your database
```

### 4. Start Application
```bash
npm run dev
```

## Database Schema

### Tables Created:
1. **institutions** - College/Institution master
2. **campuses** - Campus under institutions
3. **departments** - Departments under campuses
4. **programs** - Academic programs/branches
5. **quotas** - Seat quotas per program (KCET, COMEDK, Management)
6. **applicants** - Student applicant details (15 fields)
7. **admissions** - Admission records with seat allocation

### Key Features:
- Foreign key relationships
- Automatic timestamps
- Unique admission numbers
- Real-time seat counter (filledSeats in quotas)
- Document and fee status tracking

## Troubleshooting

### Connection Error
If you get "DATABASE_URL must be set" error:
1. Ensure .env file exists
2. Check DATABASE_URL format
3. Verify PostgreSQL is running
4. Test connection: `psql -U postgres -d admission_manager`

### Migration Issues
```bash
# Reset and regenerate
npm run db:push
```
