import Client from './Client';
import commands from './commands';
import CommandManager from './CommandManager';

const appId = process.env.APPLICATION_ID as string;
const token = process.env.DISCORD_TOKEN as string;
const guildId = process.env.GUILD_ID as string;

(async () => {
  console.log('Synchronizing guild commands...');
  const commandManager = new CommandManager(appId, token);
  await commandManager.syncGuildCommands(guildId, commands);

  console.log('Connecting to gateway...');
  const client = new Client(appId, token);
  client.handleCommands(commands);
  client.connect().then(data => {
    console.log(`${data.user.username}#${data.user.discriminator} connected`);
  });
})().catch(e => console.error(e));
