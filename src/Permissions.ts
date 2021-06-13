import * as Discord from './Discord';

class Permissions {
  private readonly _perms: number;

  constructor(permissions: string) {
    this._perms = Number(permissions);
  }

  hasPermission(perm: Discord.Permission): boolean {
    return !!(perm & this._perms);
  }
}

export default Permissions;
