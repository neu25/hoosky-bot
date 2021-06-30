export type GuildConfig = {
  commandPrefixes: string[];
};

export type RolesConfig = {
  muted: string;
};

export type BirthdayMessage = {
  id: number;
  message: string;
};

export type BirthdaysConfig = {
  schedule: string;
  channel: string;
  messages: BirthdayMessage[];
};
