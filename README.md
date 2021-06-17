# Hoosky Bot

A custom-built Discord bot for the Northeastern Class of 2025 Discord server.

## Commands

All current commands are documented in `[COMMANDS.md](COMMANDS.md)`. Source files are located in `[src/commands](src/commands)`.

## Configuration

All configuration is stored in `config.json`. The shape should look like this:

```json
{
  "discord": {
    "token": "ABCD01293ndsljfjlkejw.YLFp_A.ZZFJDSKFL312f",
    "appId": "123459672673140000"
  },
  "mongodb": {
    "url": "mongodb://admin:DATABASE_PASSWORD123@127.0.0.1:27017/?authSource=admin&readPreference=primary&ssl=false",
    "db": "example" // A unique database prefix to prevent conflicts. The bot creates a new database for every server ID: e.g., "aiyan-847507390956830760".
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
