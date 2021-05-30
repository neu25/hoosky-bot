export type Command = {
  id: string;
  application_id: string;
  name: string;
  description: string;
  options?: CommandOption[];
  default_permission?: boolean;
};

export type NewCommand = Omit<Command, 'id' | 'application_id'>;

export type CommandOption = {
  name: string;
  description: string;
  type: CommandOptionType;
  required?: boolean;
  choices?: CommandOptionChoice[];
  options?: CommandOption[];
};

export enum CommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP,
  STRING,
  INTEGER,
  BOOLEAN,
  USER,
  CHANNEL,
  ROLE,
  MENTIONABLE,
}

export type CommandOptionChoice = {
  name: string;
  value: string | number;
};
