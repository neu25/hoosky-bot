import SubCommand from '../../../SubCommand';
// import CommandOption from '../../../CommandOption';
// import { CommandOptionType } from '../../../Discord';
// import {
//   calculateDayOfYear,
//   getTargetUser,
//   userHasBirthday,
//   setBirthday,
//   getBirthday,
//   unsetBirthday,
// } from '../_common';

export const list = new SubCommand({
  name: 'list',
  displayName: 'List',
  description: 'List all stored birthdays',
  handler: async ctx => {
    // TODO: fetch birthdays from database

    return ctx.respondWithMessage(`This command is not yet implemented`, true);
  },
});

export default list;
