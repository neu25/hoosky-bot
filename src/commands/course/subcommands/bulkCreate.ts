import parse from 'csv-parse';
import {
  bold,
  inlineCode,
  italics,
  multilineCode,
  pluralize,
} from '../../../format';
import { Course } from '../../../repository';
import { parseCourse, validCourseCode } from '../_common';
import SubCommand from '../../../SubCommand';
import * as Discord from '../../../Discord';
import TriggerContext from '../../../TriggerContext';
import UserError from '../../../UserError';
import ExecutionContext from '../../../ExecutionContext';

enum FollowUp {
  UPLOAD = 'upload',
  ERROR_CONFIRMATION = 'error_confirmation',
}

enum CtxState {
  COURSES = 'courses',
}

type CourseInput = {
  code: string;
  name: string;
};

const formatCourseInputList = (courseInputs: CourseInput[]): string =>
  multilineCode(
    courseInputs.map((c, i) => `${i + 1}. ${c.code} - ${c.name}`).join('\n'),
  );

const fetchFile = async (
  tctx: TriggerContext<Discord.Message>,
): Promise<string> => {
  const { attachments } = tctx.data;

  if (attachments.length === 0) {
    throw new UserError('Please upload a file.');
  }
  if (attachments.length > 1) {
    throw new UserError('Please only upload a single file.');
  }

  const file = attachments[0];
  if (!file.content_type?.includes('text/csv')) {
    throw new UserError('The file must be a CSV file.');
  }

  return tctx.api.download(file.url);
};

const parseFileContent = async (
  tctx: TriggerContext<Discord.Message>,
  content: string,
): Promise<[CourseInput[], CourseInput[]]> => {
  const parser = parse(content, {
    trim: true,
    skip_empty_lines: true,
  });

  const columnLengthError = (record: [string, string]) => {
    return new UserError(
      `Expected 2 columns, got ${record.length}: ${inlineCode(
        record.join(','),
      )}`,
    );
  };

  const rows: [string, string][] = [];
  try {
    for await (const record of parser) {
      rows.push(record);
    }
  } catch (e) {
    if (e.code === 'CSV_INCONSISTENT_RECORD_LENGTH') {
      throw columnLengthError(e.record);
    }
    throw e;
  }

  if (rows.length === 0) {
    throw new UserError('No valid lines found in the file.');
  }
  if (rows[0].length !== 2) {
    throw columnLengthError(rows[0]);
  }

  const validCourses: CourseInput[] = [];
  const invalidCourses: CourseInput[] = [];

  for (const r of rows) {
    const [code, name] = r;
    const course = { code, name };

    // Make sure the course ID is valid.
    if (validCourseCode(code)) {
      validCourses.push(course);
    } else {
      invalidCourses.push(course);
    }
  }

  return [validCourses, invalidCourses];
};

const createCourses = async (
  tctx: TriggerContext<Discord.Message>,
  ectx: ExecutionContext,
  courses: CourseInput[],
) => {
  const guildId = ectx.mustGetGuildId();
  const { channel_id: channelId, id: messageId } = tctx.data;

  const skippedCourses: CourseInput[] = [];

  // Iterate over every course: create the role and insert the entry into the database.
  for (const c of courses) {
    const existingCourse = await tctx.courses().getByCode(guildId, c.code);
    // If the course already exists, skip it.
    if (existingCourse) {
      skippedCourses.push(c);
      continue;
    }

    // Create the course role.
    const courseRole = await tctx.api.createGuildRole(guildId, {
      name: c.code,
      permissions: '0',
      mentionable: true,
    });

    const { subject } = parseCourse(c.code);
    const course: Course = {
      _id: courseRole.id,
      code: c.code,
      subject,
      name: c.name,
      roleId: courseRole.id,
      members: [],
      sections: {},
    };

    // Create course in database.
    await tctx.courses().create(guildId, course);
  }

  const skippedCount = skippedCourses.length;
  const createdCount = courses.length - skippedCount;

  let creationMsg = `Created ${pluralize('role', createdCount)} for ${bold(
    createdCount.toLocaleString(),
  )} ${pluralize('course', createdCount)}.`;

  if (skippedCount > 0) {
    const was = skippedCount === 1 ? 'was' : 'were';
    creationMsg += ` The following ${skippedCount.toLocaleString()} duplicate ${pluralize(
      'course',
      skippedCount,
    )} ${was} not added:
${formatCourseInputList(skippedCourses)}`;
  }

  return tctx.api.createMessage(channelId, {
    content: creationMsg,
    message_reference: {
      message_id: messageId,
    },
  });
};

const bulkCreate = new SubCommand({
  name: 'bulk-create',
  displayName: 'Bulk Create',
  description: 'Create many courses at once using a CSV file',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const { interaction } = ctx;
    const userId = ctx.mustGetUserId();

    await ctx.interactionApi.respondWithMessage(
      `Upload a ${inlineCode('.csv')} file, with each line formatted as ${bold(
        'Course Code, Course Name',
      )}.\nFor example, ${italics('“ENGW 1111, First-Year Writing”')}.`,
    );

    const promptMsg = await ctx.interactionApi.getResponse();

    // Expect a follow-up message from the user.
    // Thus, the user's next message will trigger the handler in `followUpHandlers.upload` below.
    ctx.expectMessageFollowUp(
      FollowUp.UPLOAD,
      interaction.channel_id ?? '',
      promptMsg.id,
      userId,
    );
  },
  msgFollowUpHandlers: {
    [FollowUp.UPLOAD]: async (tctx, ectx) => {
      const { channel_id: channelId, id: messageId } = tctx.data;
      const userId = ectx.mustGetUserId();

      let fileString: string;
      try {
        fileString = await fetchFile(tctx);
      } catch (e) {
        if (e instanceof UserError) {
          const replyMsg = await tctx.api.createErrorReply(
            channelId,
            messageId,
            e.message,
          );
          ectx.expectMessageFollowUp(
            FollowUp.UPLOAD,
            channelId,
            replyMsg.id,
            userId,
          );
          return;
        }
        throw e;
      }

      let validCourses: CourseInput[], invalidCourses: CourseInput[];
      try {
        const ret = await parseFileContent(tctx, fileString);
        validCourses = ret[0];
        invalidCourses = ret[1];
      } catch (e) {
        if (e instanceof UserError) {
          return tctx.api.createErrorReply(channelId, messageId, e.message);
        }
        throw e;
      }

      const numInvalid = invalidCourses.length;
      if (numInvalid > 0) {
        const warningMsg = `${numInvalid} ${pluralize(
          'course',
          numInvalid,
        )} in the file don’t seem to follow the input format ${bold(
          'ENGW 1111, First-Year Writing',
        )}:
${formatCourseInputList(invalidCourses)}
Do you still want to proceed? [y/n]`;

        const replyMsg = await tctx.api.createTextMessageReply(
          channelId,
          messageId,
          warningMsg,
        );

        ectx.expectMessageFollowUp(
          FollowUp.ERROR_CONFIRMATION,
          channelId,
          replyMsg.id,
          userId,
        );
        // Save all courses to the execution context's state.
        ectx.setState(CtxState.COURSES, [...validCourses, ...invalidCourses]);

        // Wait for the user's confirmation.
        return;
      }

      return createCourses(tctx, ectx, validCourses);
    },
    [FollowUp.ERROR_CONFIRMATION]: async (tctx, ectx) => {
      const userId = ectx.mustGetUserId();
      const { content, channel_id: channelId, id: messageId } = tctx.data;

      const answer = content.trim().toLowerCase();
      if (answer === 'n') {
        return tctx.api.createTextMessage(
          channelId,
          'Course creation cancelled.',
        );
      }
      if (answer !== 'y') {
        const replyMsg = await tctx.api.createErrorReply(
          channelId,
          messageId,
          'Invalid option. Please enter “y” or “n”.',
        );
        ectx.expectMessageFollowUp(
          FollowUp.ERROR_CONFIRMATION,
          channelId,
          replyMsg.id,
          userId,
        );
        return;
      }

      const courses = ectx.getState(CtxState.COURSES) as
        | CourseInput[]
        | undefined;
      if (!courses) {
        throw new Error(
          `Could not find execution context state for ${CtxState.COURSES}`,
        );
      }

      return createCourses(tctx, ectx, courses);
    },
  },
});

export default bulkCreate;
