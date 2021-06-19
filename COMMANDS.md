# Commands

This is a list of commands currently implemented in Hoosky Bot.

> Note: `[]` indicates a variable returned in the response.

## `/course`

| Command                                        | Returns                                                                                                                                                           | Description                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/course create [name] [number] [description]` | `Created role for course **[number] - [name]**` OR `That course already exists` OR `Invalid course number`                                                        | Creates a new course and associated server role. Requires the `MANAGE_ROLES` permission |
| `/course join [@role]`                         | `Joined course **[number] - [name]**` OR `You are already in that course` OR `That course does not exist`                                                         | Joins a course and assigns the appropriate course role to the user                      |
| `/course leave [@role]`                        | `Left course **[number] - [name]**` OR `You aren't in that course` OR `That course does not exist`                                                                | Leaves a course and removes the course role from the user                               |
| `/course list`                                 | `Here is a list of courses: \n [number] - [name]: [description]`                                                                                                  | Silently lists all available courses                                                    |
| `/course remove [@role]`                       | `Removed course **[number] - [name]**` OR `That course does not exist`                                                                                            | Removes a course and associated server role. Requires the `MANAGE_ROLES` permission     |
| `/course roster [@role]`                       | `Here is a list of all [count] members in **[number] - [name]**: \n [members]` OR `There are no members in **[number] - [name]**` OR `That course does not exist` | Silently lists all members currently in the course                                      |

## `/mute`

| Command             | Returns            | Description                                          |
| ------------------- | ------------------ | ---------------------------------------------------- |
| `/mute user [user]` | `Muted **[user]**` | Mutes a user. Requires the `KICK_MEMBERS` permission |

## `/ping`

| Command | Returns                     | Description                                                        |
| ------- | --------------------------- | ------------------------------------------------------------------ |
| `/ping` | `pong (latency: [latency])` | Returns the latency between sending command and receiving response |

## `/poll`

| Command                            | Returns                              | Description                                                                  |
| ---------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `/poll create [emojis] [question]` | `[question]` with reactions [emojis] | Sends a message with the user's question and reacts with each supplied emoji |

## `/unmute`

| Command               | Returns              | Description                                            |
| --------------------- | -------------------- | ------------------------------------------------------ |
| `/unmute user [user]` | `Unmuted **[user]**` | Unmutes a user. Requires the `KICK_MEMBERS` permission |
