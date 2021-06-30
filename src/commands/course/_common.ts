import { bold } from '../../format';
import { Course } from '../../repository';

/**
 * Returns a formatted version of the course name.
 *
 * @param course The course to format.
 */
export const formatCourse = (course: Course): string => {
  return `${course._id} - ${course.name}`;
};

/**
 * Returns a partially-bolded version of the full course string. Only the course
 * subject and number are bolded, not the name.
 *
 * @param course The course to format and partially bold.
 */
export const semiBoldCourse = (course: Course): string => {
  return bold(course._id) + ` - ${course.name}`;
};

/**
 * Returns a bolded version of the full course string.
 *
 * @param course The course to format and bold.
 */
export const boldCourse = (course: Course): string => {
  return bold(formatCourse(course));
};

export const validCourseId = (id: string): boolean => {
  return /^[A-Z]{2,4} [0-9]{4}$/.test(id);
};

export type NewCourse = {
  subject: string;
  number: number;
};

export const parseCourse = (id: string): NewCourse => {
  // Extract the subject code. E.g., `ENGW 1111` -> `ENGW`.
  const subject = id.split(' ')[0];
  const number = parseInt(id.split(' ')[1]);
  return { subject, number };
};
