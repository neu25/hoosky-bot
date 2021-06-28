import parse from 'csv-parse';
import { bold, inlineCode, italics } from '../../../format';
import { Course } from '../../../repository';
import { parseCourse, validCourseId } from '../_common';
import SubCommand from '../../../SubCommand';
import * as Discord from '../../../Discord';

enum FollowUp {
  UPLOAD = 'upload',
}

type CourseInput = {
  id: string;
  name: string;
};

const bulkCreate = new SubCommand({
  name: 'bulk-create',
  displayName: 'Bulk Create',
  description: 'Create many courses at once using a CSV file',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const userId = ctx.mustGetUserId();

    // Expect a follow-up message from the user.
    // Thus, the user's next message will trigger the handler in `followUpHandlers.upload` below.
    ctx.expectFollowUp(userId, FollowUp.UPLOAD);

    await ctx.respondWithMessage(
      `Upload a ${inlineCode('.csv')} file, with each line formatted as ${bold(
        'Course Code, Course Name',
      )}.\nFor example, ${italics('“ENGW 1111, First-Year Writing”')}.`,
    );
  },
  followUpHandlers: {
    [FollowUp.UPLOAD]: async (tctx, ectx) => {
      const {
        attachments,
        channel_id: channelId,
        id: messageId,
        guild_id: guildId,
      } = tctx.data;
      if (!guildId) {
        throw new Error('No guild ID found in message data');
      }
      const userId = ectx.mustGetUserId();

      if (attachments.length === 0) {
        return tctx.api.createErrorReply(
          channelId,
          messageId,
          'Please upload a file.',
        );
      }
      if (attachments.length > 1) {
        return tctx.api.createErrorReply(
          channelId,
          messageId,
          'Please only upload a single file.',
        );
      }

      const file = attachments[0];
      if (!file.content_type?.includes('text/csv')) {
        return tctx.api.createErrorReply(
          channelId,
          messageId,
          'The file must be a CSV file.',
        );
      }

      const data = await tctx.api.download(file.url);
      const parser = parse(data, {
        trim: true,
        skip_empty_lines: true,
      });

      const courses: CourseInput[] = [];
      try {
        for await (const record of parser) {
          const [id, name] = record;

          // Make sure the course ID is valid.
          if (!validCourseId(id)) {
            await tctx.api.createErrorReply(
              channelId,
              messageId,
              `Invalid course ID: ${inlineCode(id)}`,
            );
            return;
          }

          courses.push({ id, name });
        }
      } catch (e) {
        if (e.code === 'CSV_INCONSISTENT_RECORD_LENGTH') {
          return tctx.api.createErrorReply(
            channelId,
            messageId,
            `Expected 2 columns, got ${e.record.length}: ${inlineCode(
              e.record.join(','),
            )}`,
          );
        }
        throw e;
      }

      // Iterate over every course: create the role and insert the entry into the database.
      for (const c of courses) {
        // If the course already exists, just update the name in the database.
        if (await tctx.courses().exists(guildId, c.id)) {
          await tctx.courses().updateById(guildId, c.id, {
            name: c.name,
          });
          continue;
        }

        // Create the course role.
        const courseRole = await tctx.api.createGuildRole(guildId, {
          name: c.id,
          permissions: '0',
          mentionable: true,
        });

        const { subject, number } = parseCourse(c.id);
        const course: Course = {
          _id: c.id,
          subject,
          number,
          name: c.name,
          roleId: courseRole.id,
          members: [],
        };
        // Create course in database.
        await tctx.courses().create(guildId, course);
      }

      // Stop treated this user's messages as follow-ups.
      ectx.unexpectFollowUp(userId);

      return tctx.api.createMessage(channelId, {
        content: `Created roles for ${bold(courses.length.toString())} courses`,
        message_reference: {
          message_id: messageId,
        },
      });
    },
  },
});

export default bulkCreate;
