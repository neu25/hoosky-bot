import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Client from './Client';
import { loadConfig } from './config';
import commands from './commands';
import triggers from './triggers';
import CommandManager from './CommandManager';
import { Database } from './database';
import Api from './Api';

(async () => {
  const argv = await yargs(hideBin(process.argv)).argv;
  const configPath = (argv.config as string) || 'config.json';
  const config = await loadConfig(configPath);

  console.log('Fetching list of joined guilds...');
  const api = new Api(config.discord.appId, config.discord.token);
  const guilds = await api.getCurrentGuilds();
  const guildIds = guilds.map(g => g.id);
  for (let i = 0; i < guilds.length; i++) {
    console.log(`  (${i + 1}) ${guilds[i].name}`);
  }

  console.log('Connecting to database...');
  const database = new Database(config.mongodb.url, config.mongodb.db);
  await database.connect();
  await database.initializeConfig(guildIds);

  console.log('Synchronizing guild commands...');
  const commandManager = new CommandManager(
    config.discord.appId,
    config.discord.token,
  );
  await commandManager.syncGuildCommands(guildIds, commands);

  console.log('Connecting to gateway...');
  const client = new Client(
    config.discord.appId,
    config.discord.token,
    database,
  );

  // Supply the commands we'd like to handle.
  client.handleCommands(commands);
  // Supply the triggers we'd like to handle.
  client.handleTriggers(triggers);

  client.connect().then(data => {
    console.log(`${data.user.username}#${data.user.discriminator} connected`);
  });
})().catch(e => console.error(e));
