-- Seed data for development — run after schema.sql

-- Users (password_hash is bcrypt of 'password123')
INSERT INTO users (full_name, email, password_hash, role, is_authorized, student_id, gpa, department, faculty, credits) VALUES
  ('Admin User',       'admin@simba.au',      '$2b$10$goNqCAPFaUq66uIozDSwp.aKyIaSuh/ygO1J8V13n.P26HsAVKYrK', 'admin',      true, null, null, null, null, null),
  ('Instructor One',   'instructor@simba.au', '$2b$10$goNqCAPFaUq66uIozDSwp.aKyIaSuh/ygO1J8V13n.P26HsAVKYrK', 'instructor', true, null, null, null, null, null),
  ('Student One',      'student@simba.au',    '$2b$10$goNqCAPFaUq66uIozDSwp.aKyIaSuh/ygO1J8V13n.P26HsAVKYrK', 'student',    true, '6710990', 3.61, 'COMPUTER SCIENCE', 'ENGINEERING, SCIENCE AND TECHNOLOGY', 68);

-- Courses
INSERT INTO courses (course_name, course_code, credits, faculty) VALUES
  ('Introduction to Programming', 'CS101', 3, 'Computing & IT'),
  ('Calculus I',                  'MA101', 3, 'Science & Mathematics');

-- Timeframes (2-week blocks)
INSERT INTO timeframes (label, start_date, end_date) VALUES
  ('Block 1 — 2026', '2026-06-22', '2026-07-03'),
  ('Block 2 — 2026', '2026-07-06', '2026-07-17');

-- Sections
INSERT INTO sections (course_id, section_number, instructor_id, room, timeframe_id) VALUES
  (1, 'SEC-01', 2, 'Room A72', 1),
  (2, 'SEC-01', 2, 'Room B10', 2);

-- Enrollments
INSERT INTO enrollments (section_id, student_id) VALUES
  (1, 3),
  (2, 3);

-- Bookings for Section 1 (CS101, Block 1: 2026-06-22 to 2026-07-03)
INSERT INTO bookings (section_id, date, start_time, end_time, room) VALUES
  (1, '2026-06-22', '09:00', '10:30', 'Room A72'),
  (1, '2026-06-23', '09:00', '10:30', 'Room A72'),
  (1, '2026-06-24', '09:00', '10:30', 'Room A72'),
  (1, '2026-06-25', '09:00', '10:30', 'Room A72'),
  (1, '2026-06-26', '09:00', '10:30', 'Room A72'),
  (1, '2026-06-29', '09:00', '10:30', 'Room A72'),
  (1, '2026-06-30', '09:00', '10:30', 'Room A72'),
  (1, '2026-07-01', '09:00', '10:30', 'Room A72'),
  (1, '2026-07-02', '09:00', '10:30', 'Room A72'),
  (1, '2026-07-03', '09:00', '10:30', 'Room A72');

-- Bookings for Section 2 (MA101, Block 2: 2026-07-06 to 2026-07-17)
INSERT INTO bookings (section_id, date, start_time, end_time, room) VALUES
  (2, '2026-07-06', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-07', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-08', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-09', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-10', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-13', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-14', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-15', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-16', '12:00', '13:30', 'Room B10'),
  (2, '2026-07-17', '12:00', '13:30', 'Room B10');
