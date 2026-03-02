-- Clear all dummy data from database
-- Run this in pgAdmin Query Tool

-- Delete in reverse order due to foreign key constraints
DELETE FROM admissions;
DELETE FROM applicants;
DELETE FROM quotas;
DELETE FROM programs;
DELETE FROM departments;
DELETE FROM campuses;
DELETE FROM institutions;

-- Reset sequences
ALTER SEQUENCE admissions_id_seq RESTART WITH 1;
ALTER SEQUENCE applicants_id_seq RESTART WITH 1;
ALTER SEQUENCE quotas_id_seq RESTART WITH 1;
ALTER SEQUENCE programs_id_seq RESTART WITH 1;
ALTER SEQUENCE departments_id_seq RESTART WITH 1;
ALTER SEQUENCE campuses_id_seq RESTART WITH 1;
ALTER SEQUENCE institutions_id_seq RESTART WITH 1;
