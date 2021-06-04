import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Client from './Client';
import { loadConfig } from './config';
import commands from './commands';
import CommandManager from './CommandManager';
import { Database } from './database';

(async () => {
  const argv = await yargs(hideBin(process.argv)).argv;
  const configPath = (argv.config as string) || 'config.json';
  const config = await loadConfig(configPath);

  console.log('Connecting to database...');
  const database = new Database(config.mongodb.url);
  await database.connect();

  console.log('Synchronizing guild commands...');
  const commandManager = new CommandManager(
    config.discord.appId,
    config.discord.token,
  );
  await commandManager.syncGuildCommands(config.discord.guildId, commands);

  console.log('Connecting to gateway...');
  const client = new Client(config.discord.appId, config.discord.token);
  // Supply the commands we'd like to handle to the client.
  client.handleCommands(commands);
  client.connect().then(data => {
    console.log(`${data.user.username}#${data.user.discriminator} connected`);
  });
})().catch(e => console.error(e));
