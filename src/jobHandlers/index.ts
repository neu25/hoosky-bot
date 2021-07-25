import Api from '../Api';
import { Repositories } from '../repository';
import unmute, { UnmuteJobData } from './unmute';

export enum JobType {
  UNMUTE = 'unmute',
}

export type JobTypeMap = {
  [JobType.UNMUTE]: UnmuteJobData;
};

export type JobContext<T extends JobType> = {
  data: JobTypeMap[T];
  api: Api;
  repos: Repositories;
};

export type JobHandler<T extends JobType> = (
  data: JobContext<T>,
) => Promise<unknown>;

export type JobHandlers = {
  [T in JobType]: JobHandler<T>;
};

const jobHandlers: JobHandlers = {
  [JobType.UNMUTE]: unmute,
};

export default jobHandlers;
