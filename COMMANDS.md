# Commands

This is a list of commands currently implemented in Hoosky Bot.

> Note: `[]` indicates a variable argument.
> Note: `[?]` indicates an optional argument.

## `/birthday` [WIP]

| Command                              | Description                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| `/birthday list`                     | Lists all stored birthdays.                                          |
| `/birthday message-add [message]`    | Adds a birthday message. Requires the `MANAGE_ROLES` permission.     |
| `/birthday message-delete [message]` | Deletes a birthday message. Requires the `MANAGE_ROLES` permission.  |
| `/birthday message-list`             | Lists all birthday messages. Requires the `MANAGE_ROLES` permission. |
| `/birthday set [date] [user?]`       | Sets a user's birthday. Defaults to command executor.                |
| `/birthday setup [channel]`          | Sets the birthdays channel. Requires the `MANAGE_ROLES` permission.  |
| `/birthday show [user?]`             | Shows a user's birthday. Defaults to command executor.               |
| `/birthday unset [user?]`            | Unsets a user's birthday. Defaults to command executor.              |

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
