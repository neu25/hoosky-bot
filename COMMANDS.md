# Commands

This is a list of commands currently implemented in Hoosky Bot.

> Note: `[]` indicates a variable argument.
> Note: `[?]` indicates an optional argument.

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

| Command                                    | Description                                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/course create [name] [id]`               | Creates a new course and associated server role. Requires the `MANAGE_ROLES` permission.                                                               |
| `/course delete [@role]`                   | Removes a course and associated server role. Requires the `MANAGE_ROLES` permission.                                                                   |
| `/course list-all`                         | Silently lists all available courses.                                                                                                                  |
| `/course list-joined [@user?]`             | Silently lists all joined courses for the specified user. If no user is specified, defaults to the user who ran the command.                           |
| `/course join [@role] [section?]`          | Joins a course and assigns the appropriate course role to the user.                                                                                    |
| `/course leave [@role]`                    | Leaves a course and removes the course role from the user.                                                                                             |
| `/course roster [@role] [section?]`        | Silently lists all members currently in the course. If a section number is provided, only lists members in that section of the course.                 |
| `/course classmates [@user?]`              | Silently lists all users who share a section of any course with the specified user. If no user is specified, defaults to the user who ran the command. |
| `/course switch-section [@role] [section]` | Switches to the specificed section of the course.                                                                                                      |
