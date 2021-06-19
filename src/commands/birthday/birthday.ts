import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import {
  getTargetUser,
  setBirthday,
  unsetBirthday,
  userHasBirthday,
} from './_common';

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
        const guildId = ctx.mustGetGuildId();
        const targetBirthday = ctx.getArgument<string>('date') as string;
        const requestor = ctx.interaction.member?.user;
        const requestorId = requestor?.id;
        const targetUserId = ctx.getArgument<string>('user') as string;

        const targetUser = await getTargetUser(ctx, requestorId, targetUserId);

        if (targetUser) {
          if (await userHasBirthday(ctx, guildId, targetUser.id)) {
            const birthday = await setBirthday(ctx, guildId, {
              userId: targetUser.id,
              birthday: targetBirthday,
            });

            if (birthday) {
              return ctx.respondWithMessage(
                `Birthday (${targetBirthday}) set for ${targetUser.username}#${targetUser.discriminator}`,
              );
            }

            return ctx.respondWithMessage(`Unable to set birthday`, true);
          }

          return ctx.respondWithMessage(
            `A birthday is already set for ${targetUser.username}#${targetUser.discriminator}`,
            true,
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
        const guildId = ctx.mustGetGuildId();
        const requestor = ctx.interaction.member?.user;
        const requestorId = requestor?.id;
        const targetUserId = ctx.getArgument<string>('user') as string;

        const targetUser = await getTargetUser(ctx, requestorId, targetUserId);

        if (targetUser) {
          // TODO: Remove birthday from database

          if (await userHasBirthday(ctx, guildId, targetUser.id)) {
            // TODO: remove from db
            unsetBirthday(ctx, guildId, targetUser.id);

            return ctx.respondWithMessage(
              `Birthday unset for ${targetUser.username}#${targetUser.discriminator}`,
            );
          }

          return ctx.respondWithMessage(
            `No birthday is set for ${targetUser.username}#${targetUser.discriminator}`,
            true,
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
