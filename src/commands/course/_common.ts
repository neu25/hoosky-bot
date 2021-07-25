import { bold, EN_SPACE, fancyCenter, underline } from '../../format';
import { Course, Section } from '../../repository';
import ExecutionContext from '../../ExecutionContext';
import { Page, paginate } from '../../paginate';
import * as Discord from '../../Discord';

// The number of subjects to display per page (for `/course list-all`).
export const SUBJECTS_PER_PAGE = 6;

// The decorative width of subject headings.
export const SUBJECT_HEADING_WIDTH = 30;

/**
 * Groups courses of the same subject together for easy display.
 */
type SubjectGroup = {
  subject: string;
  heading: string;
  list: string;
};

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

export const fetchCoursePages = async (
  ctx: ExecutionContext,
): Promise<Page<SubjectGroup>[]> => {
  const guildId = ctx.mustGetGuildId();
  const courses = await (
    await ctx.courses().scan(guildId)
  )
    .sort({
      subject: 1,
      code: 1,
    })
    .toArray();

  // Hold an array of subject groups to output.
  const subGroups: SubjectGroup[] = [];
  // Record the current subject being written to.
  let curGroup: SubjectGroup | null = null;

  // Iterate over every course.
  for (const c of courses) {
    // If the course's subject is different, then create a new subject group.
    if (!curGroup || c.subject !== curGroup.subject) {
      curGroup = {
        subject: c.subject,
        heading: fancyCenter(c.subject, SUBJECT_HEADING_WIDTH),
        list: '',
      };
      subGroups.push(curGroup);
    }

    // Write the course to the subject group.
    curGroup.list += formatListedCourse(c) + '\n';
  }

  return paginate(
    subGroups.map(g => ({
      sortKey: g.subject,
      data: g,
    })),
    SUBJECTS_PER_PAGE,
  );
};

export const constructSubjectEmbedFromPage = (
  page: Page<SubjectGroup>,
  totalPageCount: number,
): Discord.Embed => {
  // Map subject groups to Discord embed fields.
  const fields = page.items.map(item => ({
    name: item.data.heading, // The subject name.
    value: item.data.list, // The course list.
  }));

  return {
    type: Discord.EmbedType.RICH,
    title:
      `(Page ` +
      underline(`${page.id + 1}/${totalPageCount}`) +
      `)${EN_SPACE}Viewing subjects ` +
      bold(`${page.startKey} — ${page.endKey}`),
    fields,
  };
};

export const constructSubjectSelectFromPages = (
  pages: Page<SubjectGroup>[],
): Discord.MessageComponent => {
  return {
    type: Discord.MessageComponentType.SelectMenu,
    custom_id: 'courses-open-page',
    placeholder: 'View a different page',
    options: pages.map(p => ({
      label: `${p.startKey} — ${p.endKey}`,
      value: p.id.toString(10),
    })),
  };
};
