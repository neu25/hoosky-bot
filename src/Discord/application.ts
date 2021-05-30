import { User } from './user';

export type ClientStatus = {
  // https://discord.com/developers/docs/topics/gateway#client-status-object
};

export type Application = {
  id: string;
  name: string;
  icon: string;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  owner: User;
  summary: string;
  flags: number;
  // ... and several other omitted fields
  // https://discord.com/developers/docs/resources/application#application-object
};
