# Hoosky Bot

![Deploy Workflow](https://github.com/nu25/hoosky-bot/actions/workflows/deploy.yml/badge.svg)

A custom-built Discord bot for the Northeastern Class of 2025 Discord server.

## Commands

All current commands are documented in [`COMMANDS.md`](COMMANDS.md). Source files are located in [`src/commands`](src/commands).

## Configuration

All configuration is stored in `config.json`. The shape should look like this:

```jsonc
{
  "discord": {
    "token": "ABCD01293ndsljfjlkejw.YLFp_A.ZZFJDSKFL312f",
    "appId": "098765432123456789"
  },
  "mongodb": {
    "url": "mongodb://admin:DATABASE_PASSWORD123@127.0.0.1:27017/?authSource=admin&readPreference=primary&ssl=false",
    "db": "example" // A unique database prefix to prevent conflicts. The bot creates a new database for every server ID: e.g., "example-123456789098765432".
  }
}
```

⚠️ Do not commit this file to the repo! By default, it is included in the `.gitignore` file to be ignored by Git.

## Structure

```
.
├── COMMANDS.md
├── package.json
├── README.md (this)
└── src
    ├── commands
    ├── database
    ├── Discord
    ├── triggers
    └── config.ts
```

## Getting Started

> How to set up Hoosky Bot locally

### Obtaining the language and code

1. Make sure your computer has `git`, and run

```bash
git clone git@github.com:nu25/hoosky-bot.git
```

in the directory where you want to clone the bot.

2. Ensure Node.js and NPM (the package manager for Node.js) are installed. Install from here: https://nodejs.org/en/

3. In the code folder, run

```bash
npm install
```

to install all necessary dependencies and libraries.

4. You're done!

### Creating a test Discord application

1. Turn on Developer Mode by going to your Discord settings > "Advanced" > "Developer Mode".

2. Create a new Discord server for testing the bot yourself. Right click on the server icon and "Copy ID". Save this somewhere.

3. Go to https://discord.com/developers/applications and click "New Application". Enter any name. Click "Copy" under "Application ID", and save this somewhere.

4. On the left panel, click "Bot" and then "Add Bot". On the Bot page, click "Copy" to copy the bot's token. Save this somewhere.

5. Go to "OAuth2", and in the "Scopes" section, check "bot" and "applications.commands". Scroll down to "Bot Permissions" and check "Administrator". Click "Copy" to copy the generated URL.

6. Navigate to the copied URL and invite the bot to your test server.

7. You're done!

### Running Hoosky Bot

1. Set 3 environment variables: `APPLICATION_ID`, with your saved application ID; `DISCORD_TOKEN`, with your saved bot token; and `GUILD_ID`, with your saved server ID.

2. In the code folder, run

```bash
npm start
```

3. The bot should now be running in your server!

### Making changes to the code

1. We'll use GitHub Pull Requests to merge your changes onto the `main` and `dev` branches, so commit your changes onto your own branch.

2. Branch naming: name your branches as `<username>/tiny_description`.
