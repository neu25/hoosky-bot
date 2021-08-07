import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { bold } from '../../../format';

const rename = new SubCommand({
  name: 'rename',
  displayName: 'Rename Course',
  description: 'Renames a course',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'role',
      description: 'The course role',
      required: true,
      type: Discord.CommandOptionType.ROLE,
    }),
    new CommandOption({
      name: 'new-name',
      description: 'The course’s new name',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role')!;
    const name = ctx.getArgument<string>('new-name')!;

    const course = await ctx.courses().getByRoleId(guildId, roleId);
    if (!course) {
      return ctx.interactionApi.respondWithError('That course does not exist');
    }

    await ctx.courses().updateByRoleId(guildId, roleId, {
      name,
    });

    return ctx.interactionApi.respondWithMessage(
      `${bold(course.code)} renamed from ${bold(course.name)} to ${bold(
        name,
      )}.`,
    );
  },
});

export default rename;
