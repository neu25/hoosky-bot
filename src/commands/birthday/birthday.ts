// import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import { getTargetUser } from './_common';

const birthday = new Command({
  name: 'birthday',
  description: "Manage a user's birthday",
  options: [
    new SubCommand({
      name: 'set',
      displayName: 'Set',
      description: "Set a user's birthday",
      options: [
        new CommandOption({
          name: 'date',
          description: "User's birthday (MM/DD)",
          required: true,
          type: CommandOptionType.STRING,
        }),
        new CommandOption({
          name: 'user',
          description: 'User',
          required: false,
          type: CommandOptionType.USER,
        }),
      ],
      handler: async ctx => {
        // const guildId = ctx.mustGetGuildId();
        const targetBirthday = ctx.getArgument<string>('date') as string;
        const requestor = ctx.interaction.member?.user;
        const requestorId = requestor?.id;
        const targetUserId = ctx.getArgument<string>('user') as string;

        const targetUser = await getTargetUser(ctx, requestorId, targetUserId);

        if (targetUser) {
          // TODO: Check if user already has a birthday set
          // -> if so, return an error message

          return ctx.respondWithMessage(
            `Birthday (${targetBirthday}) set for ${targetUser.username}#${targetUser.discriminator}`,
          );
        }
      },
    }),
    new SubCommand({
      name: 'unset',
      displayName: 'Unset',
      description: "Unset a user's birthday",
      options: [
        new CommandOption({
          name: 'user',
          description: 'User',
          required: false,
          type: CommandOptionType.USER,
        }),
      ],
      handler: async ctx => {
        const requestor = ctx.interaction.member?.user;
        const requestorId = requestor?.id;
        const targetUserId = ctx.getArgument<string>('user') as string;

        const targetUser = await getTargetUser(ctx, requestorId, targetUserId);

        if (targetUser) {
          // TODO: Remove birthday from database
          // -> if so, return an error message

          return ctx.respondWithMessage(
            `Birthday unset for ${targetUser.username}#${targetUser.discriminator}`,
          );
        }
      },
    }),
    new SubCommand({
      name: 'list',
      displayName: 'List',
      description: 'List all stored birthdays',
      handler: async ctx => {
        // TODO: fetch birthdays from database

        return ctx.respondWithMessage(`This is not yet implemented`);
      },
    }),
  ],
});

export default birthday;
