# Commands

## Command classes

| Class               | Description                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Command**         | The required root command that either has a `handler` or has `options` of class `SubCommand` or `SubCommandGroup`.                     |
| **SubCommand**      | A child command that _must_ have a `handler`.                                                                                          |
| **SubCommandGroup** | A child with `options` of class `SubCommand`. It _does not_ have a `handler`, but the provided `name` creates a new command namespace. |

## Creating new commands

The following is a fully-functional template displaying how commands, sub-commands, and sub-command groups can be used.

It supports the following commands:

```shell
/permissions user add role:@Moderator
/permissions user ban temp:True
```

```typescript
import * as Discord from '../Discord';
import Command from '../Command';
import SubCommand from '../SubCommand';
import SubCommandGroup from '../SubCommandGroup';
import CommandOption from '../CommandOption';

const permissions = new Command({
  name: 'permissions',
  description: 'Modify permissions',
  options: [
    new SubCommandGroup({
      name: 'user',
      description: 'Modify the permissions of a user',
      options: [
        new SubCommand({
          name: 'add',
          description: 'Add a permission to a user',
          options: [
            new CommandOption({
              name: 'role',
              description: 'Give the role to the user',
              type: Discord.CommandOptionType.ROLE,
            }),
          ],
          handler: async ctx => {
            // Retrieve the argument from `ExecutionContext`.
            // Note the type variable `string`, which casts the returned value into a `string`.
            const roleId = ctx.getArgument<string>('role');
          },
        }),
        new SubCommand({
          name: 'ban',
          description: 'Ban a user',
          options: [
            new CommandOption({
              name: 'temp',
              description: 'Temporarily ban a user',
              type: Discord.CommandOptionType.BOOLEAN,
            }),
          ],
          handler: async ctx => {
            // Here, the type variable is `boolean`.
            const temp = ctx.getArgument<boolean>('temp');
          },
        }),
      ],
    }),
  ],
});

export default permissions;
```
