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
| `/birthday set [date]`                   | Sets the command executor's birthday.                  | any            |
| `/birthday set-channel [channel]`        | Sets the birthdays channel.                            | `MANAGE_ROLES` |
| `/birthday set-role [@role]`             | Sets the birthday role.                                | `MANAGE_ROLES` |
| `/birthday set-schedule [hour] [minute]` | Sets the birthdays schedule.                           | `MANAGE_ROLES` |
| `/birthday show [user?]`                 | Shows a user's birthday. Defaults to command executor. | any            |
| `/birthday show-schedule`                | Gets the birthdays schedule.                           | `MANAGE_ROLES` |
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

## `/autoclear`

| Command                           | Description                                                                                                                                    | Permissions       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `/autoclear [channel] [duration]` | Automatically clears messages in specified channel after a specified number of hours. If duration is 0, disables autoclearing for the channel. | `MANAGE_CHANNELS` |

## `/course`

| Command                                    | Description                                                                                                                                            | Permissions    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `/course create [name] [id]`               | Creates a new course and associated server role.                                                                                                       | `MANAGE_ROLES` |
| `/course delete [@role]`                   | Removes a course and associated server role.                                                                                                           | `MANAGE_ROLES` |
| `/course list-all`                         | Silently lists all available courses.                                                                                                                  | any            |
| `/course list-joined [@user?]`             | Silently lists all joined courses for the specified user. If no user is specified, defaults to the user who ran the command.                           | any            |
| `/course join [@role] [section?]`          | Joins a course and assigns the appropriate course role to the user.                                                                                    | any            |
| `/course leave [@role]`                    | Leaves a course and removes the course role from the user.                                                                                             | any            |
| `/course roster [@role] [section?]`        | Silently lists all members currently in the course. If a section number is provided, only lists members in that section of the course.                 | any            |
| `/course classmates [@user?]`              | Silently lists all users who share a section of any course with the specified user. If no user is specified, defaults to the user who ran the command. | any            |
| `/course switch-section [@role] [section]` | Switches to the specified section of the course.                                                                                                       | any            |
