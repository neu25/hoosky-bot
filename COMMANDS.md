# Commands

This is a list of commands currently implemented in Hoosky Bot.

> Note: `[]` indicates a variable returned in the response. | `*` indicates an optional parameter.

## `/birtthday`

| Command                        | Returns                                      | Description                                     |
| ------------------------------ | -------------------------------------------- | ----------------------------------------------- |
| `/birthday set [date] [*user]` | `Birthday set for **[user]**`                | Set a user's birthday. Defaults to requestor.   |
| `/birthday unset [*user]`      | `Birthday unset for **[user]**`              | Unset a user's birthday. Defaults to requestor. |
| `/birthday list`               | `Here's a list of birthdays: \n [birthdays]` | Lists all stored birthdays.                     |

## `/mute`

| Command             | Returns            | Description                                          |
| ------------------- | ------------------ | ---------------------------------------------------- |
| `/mute user [user]` | `Muted **[user]**` | Mutes a user. Requires the `KICK_MEMBERS` permission |

## `/ping`

| Command | Description                                                             |
| ------- | ----------------------------------------------------------------------- |
| `/ping` | Returns the latency between sending a command and receiving a response. |

## `/poll`

| Command                            | Description                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `/poll create [emojis] [question]` | Sends a message with the user's question and reacts with each supplied emoji. |

## `/mute`

| Command               | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `/mute add [user]`    | Mutes a user. Requires the `KICK_MEMBERS` permission.      |
| `/mute remove [user]` | Unmutes a user. Requires the `KICK_MEMBERS` permission.    |
| `/mute setup`         | Sets up the muted role and configures channel permissions. |

## `/course`

| Command                      | Description                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `/course create [name] [id]` | Creates a new course and associated server role. Requires the `MANAGE_ROLES` permission. |
| `/course delete [@role]`     | Removes a course and associated server role. Requires the `MANAGE_ROLES` permission.     |
| `/course list`               | Silently lists all available courses.                                                    |
| `/course join [@role]`       | Joins a course and assigns the appropriate course role to the user.                      |
| `/course leave [@role]`      | Leaves a course and removes the course role from the user.                               |
| `/course roster [@role]`     | Silently lists all members currently in the course.                                      |
