import { pool } from "./db";

export async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institutions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campuses (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      institution_id INTEGER NOT NULL REFERENCES institutions(id),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      campus_id INTEGER NOT NULL REFERENCES campuses(id),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS programs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      department_id INTEGER NOT NULL REFERENCES departments(id),
      course_type TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      total_intake INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotas (
      id SERIAL PRIMARY KEY,
      program_id INTEGER NOT NULL REFERENCES programs(id),
      quota_type TEXT NOT NULL,
      seat_count INTEGER NOT NULL,
      filled_seats INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applicants (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      gender TEXT NOT NULL,
      category TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      qualifying_exam TEXT NOT NULL,
      marks TEXT NOT NULL,
      father_name TEXT NOT NULL,
      mother_name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      document_status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admissions (
      id SERIAL PRIMARY KEY,
      applicant_id INTEGER NOT NULL REFERENCES applicants(id),
      program_id INTEGER NOT NULL REFERENCES programs(id),
      quota_type TEXT NOT NULL,
      allotment_number TEXT,
      fee_status TEXT NOT NULL DEFAULT 'Pending',
      admission_number TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'Allocated',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      confirmed_at TIMESTAMP
    );
  `);
}
