import Client from './Client';
import commands from './commands';
import axios from 'axios';
import CommandManager from './CommandManager';

(async () => {
  const appId = process.env.APPLICATION_ID as string;
  const token = process.env.DISCORD_TOKEN as string;
  const guildId = process.env.GUILD_ID as string;

  if (!appId) {
    throw new Error(
      'Application ID is required. Did you forget to set the `APPLICATION_ID` environment variable?',
    );
  }
  if (!token) {
    throw new Error(
      'Discord token is required. Did you forget to set the `DISCORD_TOKEN` environment variable?',
    );
  }
  if (!guildId) {
    throw new Error(
      'Guild ID is required. Did you forget to set the `GUILD_ID` environment variable?',
    );
  }

  const reqClient = axios.create({
    baseURL: `https://discord.com/api/v8/`,
    headers: {
      Authorization: `Bot ${token}`,
    },
  });

  console.log('Synchronizing guild commands...');
  const commandManager = new CommandManager(appId, reqClient);
  await commandManager.syncGuildCommands(guildId, commands);

  console.log('Connecting to gateway...');
  const client = new Client(appId, token, reqClient);
  client.handleCommands(commands);
  client.connect().then(data => {
    console.log(`${data.user.username}#${data.user.discriminator} connected`);
  });
})().catch(e => console.error(e));
