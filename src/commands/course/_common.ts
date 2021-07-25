import { bold } from '../../format';
import { Course, Section } from '../../repository';
import ExecutionContext from '../../ExecutionContext';

/**
 * Returns a formatted version of the course name.
 *
 * @param course The course to format.
 */
export const formatCourse = (course: Course): string => {
  return `${course.code} - ${course.name}`;
};

/**
 * Returns a partially-bolded version of the full course string. Only the course
 * subject and number are bolded, not the name.
 *
 * @param course The course to format and partially bold.
 */
export const semiBoldCourse = (course: Course): string => {
  return bold(course.code) + ` - ${course.name}`;
};

/**
 * Returns a partially-bolded version of the course string WITHOUT the subject code.
 * Only the number and "(NUA)" identifier are bolded, not the name.
 *
 * @param course The course to format and partially bold
 */
export const formatListedCourse = (course: Course): string => {
  const splitCode = course.code.split(' ');

  let reference = '';
  if (course.code.includes('(NUA)')) {
    reference = `NUA ${splitCode[2]}`;
  } else {
    reference = splitCode[1];
  }

  return bold(reference) + ` - ${course.name}`;
};

/**
 * Returns a bolded version of the full course string.
 *
 * @param course The course to format and bold.
 */
export const boldCourse = (course: Course): string => {
  return bold(formatCourse(course));
};

export const validCourseCode = (id: string): boolean => {
  return /^[A-Z]{2,4} [0-9]{4}$/.test(id);
};

export const findUserSection = (
  course: Course,
  userId: string,
): Section | undefined =>
  Object.values(course.sections).find(sec => sec.members.includes(userId));

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

/**
 * Adds a user to the section of a course in the database.
 * If the section does not exist, create it with the user as the first member.
 *
 * @param ctx The execution context.
 * @param course The course.
 * @param sectionNum The section number.
 * @param userId The ID of the user.
 */
export const addUserToPossiblyNonexistentSection = async (
  ctx: ExecutionContext,
  course: Course,
  sectionNum: number,
  userId: string,
): Promise<void> => {
  const guildId = ctx.mustGetGuildId();

  if (course.sections[sectionNum]) {
    await ctx
      .courses()
      .addMemberToSection(guildId, course.roleId, sectionNum, userId);
  } else {
    await ctx.courses().createSection(guildId, course.roleId, {
      number: sectionNum,
      members: [userId],
    });
  }
};
