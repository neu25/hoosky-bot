# Commands

This is a list of commands currently implemented in Hoosky Bot.

> Note: `[]` indicates a variable returned in the response.

## `/mute`

| Command             | Returns            | Description                                          |
| ------------------- | ------------------ | ---------------------------------------------------- |
| `/mute user [user]` | `Muted **[user]**` | Mutes a user. Requires the `KICK_MEMBERS` permission |

## `/ping`

| Command | Returns                     | Description                                                        |
| ------- | --------------------------- | ------------------------------------------------------------------ |
| `/ping` | `pong (latency: [latency])` | Returns the latency between sending command and receiving response |

## `/poll`

| Command                            | Returns                              | Description                                                             |
| ---------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `/poll create [emojis] [question]` | `[question]` with reactions [emojis] | Sends a message with the user's question and reacts with each supplied emoji |

## `/unmute`

| Command               | Returns              | Description                                            |
| --------------------- | -------------------- | ------------------------------------------------------ |
| `/unmute user [user]` | `Unmuted **[user]**` | Unmutes a user. Requires the `KICK_MEMBERS` permission |
