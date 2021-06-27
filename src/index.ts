import yargs from 'yargs';
import axios from 'axios';
import { hideBin } from 'yargs/helpers';
import * as Discord from './Discord';
import Client from './Client';
import { loadConfig } from './config';
import commands from './commands';
import triggers from './triggers';
import { Database } from './database';
import Api from './Api';
import { setupRepos } from './repository';
import Cache from './Cache';

(async () => {
  const argv = await yargs(hideBin(process.argv)).argv;
  const configPath = (argv.config as string) || 'config.json';
  const config = await loadConfig(configPath);
  const reqClient = axios.create({
    baseURL: `https://discord.com/api/v8/`,
    headers: {
      Authorization: `Bot ${config.discord.token}`,
    },
  });

  console.log('[Main] Fetching list of joined guilds...');
  const cache = new Cache();
  const api = new Api(config.discord.appId, reqClient, cache);
  const guilds = await api.getCurrentGuilds();
  const guildIds = guilds.map(g => g.id);
  for (let i = 0; i < guilds.length; i++) {
    console.log(`  (${i + 1}) ${guilds[i].name}`);
  }

  console.log('[Main] Connecting to database...');
  const database = new Database(config.mongodb.url, config.mongodb.db);
  await database.connect();

  // Set up model repositories, interfaces for operating on data stored in the database.
  const repos = setupRepos(database);
  // Insert default configuration values into the database.
  await repos.config.initialize(guildIds);

  console.log('[Main] Connecting to gateway...');
  const client = new Client(
    config.discord.appId,
    config.discord.token,
    repos,
    reqClient,
    api,
    [Discord.Intent.GUILDS, Discord.Intent.GUILD_MEMBERS],
  );

  // Supply the commands we'd like to handle.
  client.handleCommands(commands);
  // Supply the triggers we'd like to handle.
  client.handleTriggers([...triggers, ...cache.triggers()]);

  client.connect().then(data => {
    console.log(
      `[Main] ${data.user.username}#${data.user.discriminator} connected`,
    );
  });
})().catch(e => console.error(e));
