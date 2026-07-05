import sql from './db';
import type { StudentDashboardData } from './types';
import { weekdaysInRange } from './date-utils';

export async function getStudentDashboardData(studentEmail: string): Promise<StudentDashboardData | null> {
  // 1. Fetch student user profile details using SELECT * to avoid "column not found" errors
  // if your friend's database doesn't have the custom columns yet.
  const studentRows = await sql`
    SELECT * 
    FROM users 
    WHERE email = ${studentEmail} AND role = 'student'
  `;

  if (studentRows.length === 0) {
    return null;
  }
  const dbStudent = studentRows[0] as any;

  // Map database columns safely. If they don't exist in the database, they will be
  // undefined (which matches the optional User type and renders as '-' in the UI).
  const student = {
    id: dbStudent.id,
    fullName: dbStudent.full_name,
    email: dbStudent.email,
    role: dbStudent.role,
    isAuthorized: dbStudent.is_authorized,
    studentId: dbStudent.student_id ?? undefined,
    gpa: dbStudent.gpa != null ? parseFloat(dbStudent.gpa) : undefined,
    department: dbStudent.department ?? undefined,
    faculty: dbStudent.faculty ?? undefined,
    credits: dbStudent.credits != null ? parseInt(dbStudent.credits) : undefined,
  };

  // 2. Fetch current block timeframe (fallback to the first one if none is currently active)
  const currentBlockRows = await sql`
    SELECT 
      id, 
      label, 
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
      TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate" 
    FROM timeframes 
    WHERE CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1
  `;
  let currentBlock = currentBlockRows[0] as any || null;
  if (!currentBlock) {
    const firstBlockRows = await sql`
      SELECT 
        id, 
        label, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate" 
      FROM timeframes 
      ORDER BY start_date ASC 
      LIMIT 1
    `;
    currentBlock = firstBlockRows[0] as any || null;
  }

  // 3. Fetch enrolled sections with their associated courses and timeframes
  const enrolledSections = await sql`
    SELECT 
      e.section_id AS "sectionId",
      s.section_number AS "sectionNumber",
      s.room,
      s.instructor_id AS "instructorId",
      u.full_name AS "instructorName",
      s.course_id AS "courseId",
      c.course_name AS "courseName",
      c.course_code AS "courseCode",
      c.credits,
      s.timeframe_id AS "timeframeId",
      t.label AS "timeframeLabel",
      TO_CHAR(t.start_date, 'YYYY-MM-DD') AS "timeframeStartDate",
      TO_CHAR(t.end_date, 'YYYY-MM-DD') AS "timeframeEndDate",
      TO_CHAR(s.start_time, 'HH24:MI') AS "startTime",
      TO_CHAR(s.end_time, 'HH24:MI') AS "endTime"
    FROM enrollments e
    JOIN sections s ON e.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    JOIN timeframes t ON s.timeframe_id = t.id
    LEFT JOIN users u ON s.instructor_id = u.id
    WHERE e.student_id = ${student.id}
  `;

  const enrolledCourses = [];
  for (const row of enrolledSections as any[]) {
    // Option 2: Generate the 10 block daily bookings dynamically in memory 
    // using the start/end date of the timeframe block and the start/end time of the section.
    // If the database has no start_time or end_time, we default to standard class hours (e.g. 09:00 - 10:30).
    const startT = row.startTime || '09:00';
    const endT = row.endTime || '10:30';
    const room = row.room || '-';

    const weekdays = weekdaysInRange(row.timeframeStartDate, row.timeframeEndDate);
    const bookingRows = weekdays.map((date, index) => ({
      id: row.sectionId * 1000 + index,
      sectionId: row.sectionId,
      date,
      startTime: startT,
      endTime: endT,
      room: room,
    }));

    enrolledCourses.push({
      course: {
        id: row.courseId,
        courseName: row.courseName,
        courseCode: row.courseCode,
        credits: row.credits,
      },
      section: {
        id: row.sectionId,
        courseId: row.courseId,
        sectionNumber: row.sectionNumber,
        instructorId: row.instructorId,
        instructorName: row.instructorName,
        room: row.room,
        timeframeId: row.timeframeId,
      },
      timeframe: {
        id: row.timeframeId,
        label: row.timeframeLabel,
        startDate: row.timeframeStartDate,
        endDate: row.timeframeEndDate,
      },
      bookings: bookingRows,
    });
  }

  return {
    student,
    currentBlock,
    enrolledCourses,
    notifications: [],
  };
}
