import sql from './db';
import type { StudentDashboardData } from './types';

export async function getStudentDashboardData(studentEmail: string): Promise<StudentDashboardData | null> {
  // 1. Fetch student user profile details
  const studentRows = await sql`
    SELECT 
      id, 
      full_name AS "fullName", 
      email, 
      role, 
      is_authorized AS "isAuthorized", 
      student_id AS "studentId", 
      gpa::float, 
      department, 
      faculty, 
      credits 
    FROM users 
    WHERE email = ${studentEmail} AND role = 'student'
  `;

  if (studentRows.length === 0) {
    return null;
  }
  const student = studentRows[0] as any;

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
      c.faculty,
      s.timeframe_id AS "timeframeId",
      t.label AS "timeframeLabel",
      TO_CHAR(t.start_date, 'YYYY-MM-DD') AS "timeframeStartDate",
      TO_CHAR(t.end_date, 'YYYY-MM-DD') AS "timeframeEndDate"
    FROM enrollments e
    JOIN sections s ON e.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    JOIN timeframes t ON s.timeframe_id = t.id
    LEFT JOIN users u ON s.instructor_id = u.id
    WHERE e.student_id = ${student.id}
  `;

  const enrolledCourses = [];
  for (const row of enrolledSections as any[]) {
    // 4. Fetch bookings for this section
    const bookingRows = await sql`
      SELECT 
        id, 
        section_id AS "sectionId", 
        TO_CHAR(date, 'YYYY-MM-DD') AS "date", 
        TO_CHAR(start_time, 'HH24:MI') AS "startTime", 
        TO_CHAR(end_time, 'HH24:MI') AS "endTime", 
        room 
      FROM bookings 
      WHERE section_id = ${row.sectionId}
      ORDER BY date ASC, start_time ASC
    `;

    enrolledCourses.push({
      course: {
        id: row.courseId,
        courseName: row.courseName,
        courseCode: row.courseCode,
        credits: row.credits,
        faculty: row.faculty,
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
      bookings: bookingRows.map((b: any) => ({
        id: b.id,
        sectionId: b.sectionId,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        room: b.room,
      })),
    });
  }

  return {
    student,
    currentBlock,
    enrolledCourses,
    notifications: [],
  };
}
