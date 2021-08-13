import * as Discord from './Discord';
import Trigger from './Trigger';
import { formatEmoji } from './utils';

class Cache {
  private readonly _messages: Record<string, Discord.Message>;
  private readonly _dms: Record<string, Discord.Channel>;
  private _guilds: Record<string, Discord.Guild>;

  constructor() {
    this._messages = {};
    this._guilds = {};
    this._dms = {};
  }

  triggers(): Trigger<any>[] {
    return [
      /**
       * Guilds
       */
      new Trigger<Discord.Event.GUILD_CREATE>({
        event: Discord.Event.GUILD_CREATE,
        handler: ctx => this._updateGuild(ctx.data.id, ctx.data),
      }),
      new Trigger<Discord.Event.GUILD_UPDATE>({
        event: Discord.Event.GUILD_UPDATE,
        handler: ctx => this._updateGuild(ctx.data.id, ctx.data),
      }),
      new Trigger<Discord.Event.GUILD_DELETE>({
        event: Discord.Event.GUILD_DELETE,
        handler: ctx => this._deleteGuild(ctx.data.id),
      }),
      /**
       * Guild Roles
       */
      new Trigger<Discord.Event.GUILD_ROLE_CREATE>({
        event: Discord.Event.GUILD_ROLE_CREATE,
        handler: ctx => this._updateGuildRole(ctx.data.guild_id, ctx.data.role),
      }),
      new Trigger<Discord.Event.GUILD_ROLE_UPDATE>({
        event: Discord.Event.GUILD_ROLE_UPDATE,
        handler: ctx => this._updateGuildRole(ctx.data.guild_id, ctx.data.role),
      }),
      new Trigger<Discord.Event.GUILD_ROLE_DELETE>({
        event: Discord.Event.GUILD_ROLE_DELETE,
        handler: ctx =>
          this._deleteGuildRole(ctx.data.guild_id, ctx.data.role_id),
      }),
      /**
       * Guild Channels
       */
      new Trigger<Discord.Event.CHANNEL_CREATE>({
        event: Discord.Event.CHANNEL_CREATE,
        handler: ctx => this._updateChannel(ctx.data),
      }),
      new Trigger<Discord.Event.CHANNEL_UPDATE>({
        event: Discord.Event.CHANNEL_UPDATE,
        handler: ctx => this._updateChannel(ctx.data),
      }),
      new Trigger<Discord.Event.CHANNEL_DELETE>({
        event: Discord.Event.CHANNEL_DELETE,
        handler: ctx => this._deleteChannel(ctx.data.guild_id!, ctx.data.id),
      }),
      /**
       * Guild Members
       */
      new Trigger<Discord.Event.GUILD_MEMBER_ADD>({
        event: Discord.Event.GUILD_MEMBER_ADD,
        handler: ctx => this._updateGuildMember(ctx.data.guild_id, ctx.data),
      }),
      new Trigger<Discord.Event.GUILD_MEMBER_UPDATE>({
        event: Discord.Event.GUILD_MEMBER_UPDATE,
        handler: ctx => {
          const curMember = this.getGuildMember(
            ctx.data.guild_id,
            ctx.data.user.id,
          );
          const nextMember = Object.assign({}, curMember, ctx.data);
          this._updateGuildMember(ctx.data.guild_id, nextMember);
        },
      }),
      new Trigger<Discord.Event.GUILD_MEMBER_REMOVE>({
        event: Discord.Event.GUILD_MEMBER_REMOVE,
        handler: ctx =>
          this._removeGuildMember(ctx.data.guild_id, ctx.data.user.id),
      }),
      /**
       * Messages
       */
      /*new Trigger<Discord.Event.MESSAGE_CREATE>({
        event: Discord.Event.MESSAGE_CREATE,
        handler: ctx => this._setMessage(ctx.data),
      }),
      new Trigger<Discord.Event.MESSAGE_UPDATE>({
        event: Discord.Event.MESSAGE_UPDATE,
        handler: ctx => this._updateMessage(ctx.data.id, ctx.data),
      }),
      new Trigger<Discord.Event.MESSAGE_DELETE>({
        event: Discord.Event.MESSAGE_DELETE,
        handler: ctx => this._deleteMessage(ctx.data.id),
      }),
      new Trigger<Discord.Event.MESSAGE_REACTION_ADD>({
        event: Discord.Event.MESSAGE_REACTION_ADD,
        handler: ctx => this._addMessageReaction(ctx.data.message_id, ctx.data),
      }),
      new Trigger<Discord.Event.MESSAGE_REACTION_REMOVE>({
        event: Discord.Event.MESSAGE_REACTION_REMOVE,
        handler: ctx =>
          this._removeMessageReaction(ctx.data.message_id, ctx.data.emoji),
      }),
      new Trigger<Discord.Event.MESSAGE_REACTION_REMOVE_ALL>({
        event: Discord.Event.MESSAGE_REACTION_REMOVE_ALL,
        handler: ctx => this._removeAllMessageReactions(ctx.data.message_id),
      }),*/
    ];
  }

  getGuild(guildId: string): Discord.Guild | undefined {
    return this._guilds[guildId];
  }

  getGuilds(): Discord.Guild[] {
    return Object.values(this._guilds);
  }

  getGuildChannels(guildId: string): Discord.Channel[] | undefined {
    return this.getGuild(guildId)?.channels;
  }

  getGuildRoles(guildId: string): Discord.Role[] | undefined {
    return this.getGuild(guildId)?.roles;
  }

  getGuildMember(
    guildId: string,
    userId: string,
  ): Discord.GuildMember | undefined {
    return this.getGuild(guildId)?.members?.find(m => m.user?.id === userId);
  }

  getMessage(messageId: string): Discord.Message | undefined {
    return this._messages[messageId];
  }

  getChannel(channelId: string): Discord.Channel | undefined {
    // First check the DMs cache.
    if (this._dms[channelId]) {
      return this._dms[channelId];
    }

    // Then check each guild for that channel.
    for (const guildId of Object.keys(this._guilds)) {
      const c = this.getChannelInGuild(guildId, channelId);
      if (c) return c;
    }
  }

  getChannelInGuild(
    guildId: string,
    channelId: string,
  ): Discord.Channel | undefined {
    return this.getGuild(guildId)?.channels?.find(c => c.id === channelId);
  }

  _updateGuild(guildId: string, guild: Discord.Guild): void {
    console.log('[Cache] Updating guild', guildId);
    this._guilds[guildId] = guild;
  }

  _replaceGuilds(guilds: Discord.Guild[]): void {
    console.log('[Cache] Replacing guilds');
    const map: Record<string, Discord.Guild> = {};
    for (const g of guilds) {
      map[g.id] = g;
    }
    this._guilds = map;
  }

  _deleteGuild(guildId: string): void {
    console.log('[Cache] Deleting guild', guildId);
    delete this._guilds[guildId];
  }

  _replaceGuildRoles(guildId: string, roles: Discord.Role[]): void {
    console.log('[Cache] Replacing roles for guild', guildId);
    const guild = this.getGuild(guildId);
    if (!guild) return;

    guild.roles = roles;
  }

  _updateGuildRole(guildId: string, role: Discord.Role): void {
    console.log('[Cache] Updating role', role.id);
    const guild = this.getGuild(guildId);
    if (!guild) return;

    for (let i = 0; i < guild.roles.length; ++i) {
      const r = guild.roles[i];
      if (r.id === role.id) {
        guild.roles[i] = role;
        return;
      }
    }

    guild.roles.push(role);
  }

  _deleteGuildRole(guildId: string, roleId: string): void {
    console.log('[Cache] Deleting role', roleId);
    const guild = this.getGuild(guildId);
    if (!guild) return;

    const i = guild.roles.findIndex(r => r.id === roleId);
    if (i === -1) return;

    guild.roles.splice(i, 1);
  }

  _setMessage(message: Discord.Message): void {
    console.log('[Cache] Setting message', message.id);

    this._messages[message.id] = message;
  }

  _updateMessage(
    id: string,
    message: Partial<Omit<Discord.Message, 'id'>>,
  ): void {
    console.log('[Cache] Updating message', id);

    this._messages[id] = Object.assign({}, this._messages[id] ?? {}, message);
  }

  _addMessageReaction(
    id: string,
    eventData: Discord.MessageReactionAddPayload,
  ): void {
    console.log('[Cache] Adding message reaction to', id);

    const msg = this._messages[id];
    if (!msg) return;

    const reaction = msg.reactions?.find(
      r => formatEmoji(r.emoji) === formatEmoji(eventData.emoji),
    );
    if (reaction) {
      ++reaction.count;
    } else {
      msg.reactions = [
        ...(msg.reactions ?? []),
        {
          count: 1,
          emoji: eventData.emoji,
          me: eventData.me,
        },
      ];
    }
  }

  _removeMessageReaction(id: string, emoji: Discord.Emoji | string): void {
    console.log('[Cache] Removing message reaction from', id);

    const msg = this._messages[id];
    if (!msg) return;

    let emojiString: string;
    if (typeof emoji === 'string') {
      emojiString = emoji;
    } else {
      emojiString = formatEmoji(emoji);
    }

    const i =
      msg.reactions?.findIndex(r => formatEmoji(r.emoji) === emojiString) ?? -1;

    if (i === -1) {
      console.warn('[Cache] No reactions found');
    } else {
      const reaction = msg.reactions![i];
      --reaction.count;

      if (reaction.count <= 0) {
        msg.reactions!.splice(i, 1);
      }
    }
  }

  _removeAllMessageReactions(id: string): void {
    console.log('[Cache] Removing all message reactions from', id);

    const msg = this._messages[id];
    if (!msg) return;

    msg.reactions = [];
  }

  _deleteMessage(id: string): void {
    console.log('[Cache] Deleting message', id);

    delete this._messages[id];
  }

  _updateChannel(channel: Discord.Channel): void {
    console.log('[Cache] Updating channel', channel.id);

    const guild = channel.guild_id
      ? this.getGuild(channel.guild_id)
      : undefined;
    // If no guild was found, save the channel to the DMs cache.
    if (!guild || !guild.channels) {
      this._dms[channel.id] = channel;
      return;
    }

    for (let i = 0; i < guild.channels.length; ++i) {
      const c = guild.channels[i];
      if (c.id === channel.id) {
        guild.channels[i] = channel;
        return;
      }
    }

    guild.channels.push(channel);
  }

  _updateChannelPermissions(
    channelId: string,
    overwrite: Discord.Overwrite,
  ): void {
    console.log('[Cache] Updating channel permissions', channelId);
    const channel = this.getChannel(channelId);
    if (!channel || !channel.permission_overwrites) return;

    const i = channel.permission_overwrites.findIndex(
      o => o.id === overwrite.id,
    );
    if (i === -1) {
      channel.permission_overwrites.push(overwrite);
      return;
    }

    channel.permission_overwrites[i] = overwrite;
  }

  _replaceChannels(guildId: string, channels: Discord.Channel[]): void {
    console.log('[Cache] Replacing guild channels');

    const guild = this.getGuild(guildId);
    if (!guild) return;

    guild.channels = channels;
  }

  _deleteChannel(guildId: string, channelId: string): void {
    console.log('[Cache] Deleting channel', channelId);

    const guild = this.getGuild(guildId);
    if (!guild || !guild.channels) return;

    const i = guild.channels.findIndex(c => c.id === channelId);
    if (i === -1) return;

    guild.channels.splice(i, 1);
  }

  _updateGuildMember(guildId: string, member: Discord.GuildMember): void {
    console.log('[Cache] Updating guild member', member.user?.id);

    const guild = this.getGuild(guildId);
    if (!guild || !guild.members) return;

    for (let i = 0; i < guild.members.length; ++i) {
      const m = guild.members[i];
      if (m.user?.id === member.user?.id) {
        guild.members[i] = member;
        return;
      }
    }

    guild.members.push(member);
  }

  _addRoleToGuildMember(guildId: string, userId: string, roleId: string): void {
    console.log(`[Cache] Adding role ${roleId} to guild member`, userId);

    const guild = this.getGuild(guildId);
    if (!guild || !guild.members) return;

    const m = guild.members.find(m => m.user?.id === userId);
    if (!m) return;

    if (!m.roles.includes(roleId)) {
      m.roles.push(roleId);
    }
  }

  _removeRoleFromGuildMember(
    guildId: string,
    userId: string,
    roleId: string,
  ): void {
    console.log(`[Cache] Removing role ${roleId} from guild member`, userId);

    const guild = this.getGuild(guildId);
    if (!guild || !guild.members) return;

    const m = guild.members.find(m => m.user?.id === userId);
    if (!m) return;

    const i = m.roles.findIndex(r => r === roleId);
    if (i === -1) return;

    m.roles.splice(i, 1);
  }

  _removeGuildMember(guildId: string, userId: string): void {
    console.log('[Cache] Removing guild member', userId);

    const guild = this.getGuild(guildId);
    if (!guild || !guild.members) return;

    const i = guild.members.findIndex(m => m.user?.id === userId);
    if (i === -1) return;

    guild.members.splice(i, 1);
  }
}

export default Cache;
