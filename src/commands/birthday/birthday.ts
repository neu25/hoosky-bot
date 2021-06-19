import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import { CommandOptionType } from '../../Discord';
import {
  calculateDayOfYear,
  getTargetUser,
  userHasBirthday,
  setBirthday,
  getBirthday,
  unsetBirthday,
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

        const dayOfYear = await calculateDayOfYear(targetBirthday);

        if (targetUser) {
          if (!(await userHasBirthday(ctx, guildId, targetUser.id))) {
            const birthday = await setBirthday(ctx, guildId, {
              userId: targetUser.id,
              birthday: dayOfYear,
            });

            if (birthday) {
              return ctx.respondWithMessage(
                `Birthday (${targetBirthday}) set for ${targetUser.username}#${targetUser.discriminator}`,
              );
            }

            return ctx.respondWithError(`Unable to set birthday`);
          }

          return ctx.respondWithError(
            `A birthday is already set for ${targetUser.username}#${targetUser.discriminator}`,
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
          if (await userHasBirthday(ctx, guildId, targetUser.id)) {
            const birthday = await unsetBirthday(ctx, guildId, targetUser.id);

            if (birthday) {
              return ctx.respondWithMessage(
                `Birthday unset for ${targetUser.username}#${targetUser.discriminator}`,
              );
            }

            return ctx.respondWithError(`Error unsetting birthday`);
          }

          return ctx.respondWithError(
            `No birthday is set for ${targetUser.username}#${targetUser.discriminator}`,
          );
        }
      },
    }),

    new SubCommand({
      name: 'show',
      displayName: 'Show',
      description: "Show a user's birthday",
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
          if (await userHasBirthday(ctx, guildId, targetUser.id)) {
            const birthday = await getBirthday(ctx, guildId, targetUser.id);

            if (birthday) {
              return ctx.respondWithMessage(
                `Birthday for ${targetUser.username}#${targetUser.discriminator} is set to day ${birthday.birthday}`,
              );
            }

            return ctx.respondWithError(`Error fetching birthday`);
          }

          return ctx.respondWithError(
            `No birthday is set for ${targetUser.username}#${targetUser.discriminator}`,
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

        return ctx.respondWithMessage(
          `This command is not yet implemented`,
          true,
        );
      },
    }),
  ],
});

export default birthday;
