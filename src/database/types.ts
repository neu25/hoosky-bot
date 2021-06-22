export type GuildConfig = {
  commandPrefixes: string[];
};

export type RolesConfig = {
  muted: string;
};

export type BirthdaysConfig = {
  schedule: string;
  channel: string;
  messages: string[];
};
