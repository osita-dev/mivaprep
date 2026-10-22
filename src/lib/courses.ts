// ============================================================
// Course registry — the list of question banks the app can load.
// To add a course: drop its JSON into public/mock-data/courses/
// and add one entry here. The bank file's own "course" field
// must match the entry id.
// ============================================================

export interface CourseEntry {
  id: string; // course code — must match the bank's "course" field
  title: string; // fallback label; the bank's own title wins once loaded
  file: string; // file name inside public/mock-data/courses/
}

export const COURSES: CourseEntry[] = [
  { id: "COS102", title: "Introduction to Problem Solving", file: "COS102.json" },
  { id: "CSC106", title: "Introduction to Web Technologies", file: "CSC106.json" },
];

export const DEFAULT_COURSE_ID = "COS102";

/** Resolve a stored course id to a registry entry (unknown ids fall back to the default). */
export function resolveCourse(id: string): CourseEntry {
  return (
    COURSES.find((c) => c.id === id) ??
    COURSES.find((c) => c.id === DEFAULT_COURSE_ID) ??
    COURSES[0]
  );
}
