import dayjs from 'dayjs';
import calendarPlugin from 'dayjs/plugin/calendar';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Job } from '../../../Scheduler';
import { inlineCode } from '../../../format';

dayjs.extend(calendarPlugin);

const calendarOutputs = {
  sameDay: '[Today at] h:mm A',
  nextDay: '[Tomorrow at] h:mm A',
  nextWeek: 'dddd [at] h:mm A',
  lastDay: '[Yesterday at] h:mm A',
  lastWeek: '[Last] dddd [at] h:mm A',
  sameElse: 'DD/MM/YYYY [at] h:mm A',
};

const sortJobsByDate = (jobs: Job[]): void => {
  jobs.sort((j1, j2) => j1.targetDate.getTime() - j2.targetDate.getTime());
};

const viewJobs = new SubCommand({
  name: 'view-jobs',
  displayName: 'View Jobs',
  description: 'View the bot’s scheduled jobs',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    const sc = ctx.scheduler.mustGetScheduler(guildId);
    const jobs = sc.jobs();

    sortJobsByDate(jobs);

    const lines: string[] = [];
    for (const j of jobs) {
      const prettyDate = dayjs(j.targetDate).calendar(null, calendarOutputs);
      lines.push(`• ${prettyDate} — ${inlineCode(j.type)}`);
    }

    const content = lines.join('\n');

    return ctx.interactionApi.respondWithEmbed({
      title: 'Scheduled Jobs',
      description: content,
    });
  },
});

export default viewJobs;
