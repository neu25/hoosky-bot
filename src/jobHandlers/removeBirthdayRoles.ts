import { handleBirthdayJob } from './_common';
import { JobHandler, JobType } from './index';

export type RemoveBirthdayRolesData = {
  guildId: string;
};

const addBirthdayRoles: JobHandler<JobType.REMOVE_BIRTHDAY_ROLES> =
  async ctx => {
    return handleBirthdayJob(ctx, false);
  };

export default addBirthdayRoles;
