# Commands

This is a list of commands currently implemented in Hoosky Bot.

> Note: `[]` indicates a variable argument.
> Note: `[?]` indicates an optional argument.

## `/birthday`

| Command                                  | Description                                            | Permissions    |
| ---------------------------------------- | ------------------------------------------------------ | -------------- |
| `/birthday list`                         | Lists all stored birthdays.                            | any            |
| `/birthday message-add [message]`        | Adds a birthday message.                               | `MANAGE_ROLES` |
| `/birthday message-delete [message]`     | Deletes a birthday message.                            | `MANAGE_ROLES` |
| `/birthday message-list`                 | Lists all birthday messages.                           | `MANAGE_ROLES` |
| `/birthday schedule-get`                 | Gets the birthdays schedule.                           | `MANAGE_ROLES` |
| `/birthday schedule-set [hour] [minute]` | Sets the birthdays schedule.                           | `MANAGE_ROLES` |
| `/birthday set [date]`                   | Sets the command executor's birthday.                  | any            |
| `/birthday setup [channel]`              | Sets the birthdays channel.                            | `MANAGE_ROLES` |
| `/birthday show [user?]`                 | Shows a user's birthday. Defaults to command executor. | any            |
| `/birthday unset`                        | Unsets the command executor's birthday.                | any            |

## `/ping`

| Command | Description                                                             | Permissions |
| ------- | ----------------------------------------------------------------------- | ----------- |
| `/ping` | Returns the latency between sending a command and receiving a response. | any         |

## `/poll`

| Command                            | Description                                                                   | Permissions |
| ---------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| `/poll create [emojis] [question]` | Sends a message with the user's question and reacts with each supplied emoji. | any         |

## `/mute`

| Command               | Description                                                | Permissions    |
| --------------------- | ---------------------------------------------------------- | -------------- |
| `/mute add [user]`    | Mutes a user.                                              | `KICK_MEMBERS` |
| `/mute remove [user]` | Unmutes a user.                                            | `KICK_MEMBERS` |
| `/mute setup`         | Sets up the muted role and configures channel permissions. | any            |

## `/course`

| Command                      | Description                                                         | Permissions    |
| ---------------------------- | ------------------------------------------------------------------- | -------------- |
| `/course create [name] [id]` | Creates a new course and associated server role.                    | `MANAGE_ROLES` |
| `/course delete [@role]`     | Removes a course and associated server role.                        | `MANAGE_ROLES` |
| `/course list`               | Silently lists all available courses.                               | any            |
| `/course join [@role]`       | Joins a course and assigns the appropriate course role to the user. | any            |
| `/course leave [@role]`      | Leaves a course and removes the course role from the user.          | any            |
| `/course roster [@role]`     | Silently lists all members currently in the course.                 | any            |
