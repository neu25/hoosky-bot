import yargs from 'yargs';
import axios from 'axios';
import { hideBin } from 'yargs/helpers';
import * as Discord from './Discord';
import Client from './Client';
import { loadConfig } from './config';
import commands from './commands';
import triggers from './triggers';
import { Config, Database } from './database';
import Api from './Api';
import { GuildConfig, setupRepos } from './repository';
import Cache from './Cache';
import FollowUpManager from './FollowUpManager';
import InteractionManager from './InteractionManager';
import interactions from './interactions';
import AuditLogger from './auditLogger';

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

  // Populate the audit logger with a map of guild IDs to logging channel IDs.
  const auditLogger = new AuditLogger(api);
  for (const g of guildIds) {
    const guildCfg = await repos.config.get<GuildConfig>(g, Config.GUILD);
    if (guildCfg && guildCfg.loggingChannelId) {
      auditLogger.setChannel(g, guildCfg.loggingChannelId);
    }
  }

  console.log('[Main] Connecting to gateway...');
  const followUpManager = new FollowUpManager(api, repos, config.discord.appId);
  const interactionManager = new InteractionManager();
  interactionManager.setInteractions(interactions);

  const client = new Client({
    appId: config.discord.appId,
    token: config.discord.token,
    http: reqClient,
    intents: [
      Discord.Intent.GUILDS,
      Discord.Intent.GUILD_MEMBERS,
      Discord.Intent.GUILD_MESSAGES,
      Discord.Intent.DIRECT_MESSAGES,
    ],
    followUpManager,
    interactionManager,
    repos,
    api,
    auditLogger,
  });

  // Supply the commands we'd like to handle.
  client.setCommands(commands);
  // Supply the triggers we'd like to handle.
  client.setTriggers([...triggers, ...cache.triggers()]);

  client.connect().then(data => {
    console.log(
      `[Main] ${data.user.username}#${data.user.discriminator} connected`,
    );
    auditLogger.logGlobalMessage({
      title: 'Connection established to the gateway',
    });
  });

  {
    let shuttingDown = false;

    process.on('SIGINT', async () => {
      // Make sure this only gets executed once.
      if (shuttingDown) return;
      shuttingDown = true;

      console.log('[Main] Received termination signal');

      try {
        await auditLogger.logGlobalMessage({
          title: 'Shutting down',
          color: Discord.Color.DANGER,
        });
      } catch (e: unknown) {
        console.error(e);
      }

      process.exit(0);
    });
  }
})().catch(e => console.error(e));
