import { handleBirthdayJob } from './_common';
import { JobHandler, JobType } from './index';

export type AddBirthdayRolesData = {
  guildId: string;
};

const addBirthdayRoles: JobHandler<JobType.ADD_BIRTHDAY_ROLES> = async ctx => {
  return handleBirthdayJob(ctx, true);
};

export default addBirthdayRoles;
