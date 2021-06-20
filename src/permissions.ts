import * as Discord from './Discord';

/**
 * Returns whether `p1` is a subset of `p2`. That is, the every permission in
 * `p1` is present in `p2`.
 *
 * @param p1 The child permissions.
 * @param p2 the parent permissions
 */
export const isSubset = (p1: number, p2: number): boolean => {
  return (p1 | p2) === p2;
};

/**
 * Returns whether `p1` is a superset of `p2`. That is, the every permission in
 * `p2` is present in `p1`.
 *
 * @param p1 The parent permissions.
 * @param p2 the child permissions
 */
export const isSuperset = (p1: number, p2: number): boolean => {
  return isSubset(p2, p1);
};

/**
 * Returns whether `perms` has the permission `p`.
 *
 * @param perms The permissions to test.
 * @param p The permission to look for.
 */
export const hasPermission = (
  perms: number,
  p: Discord.Permission,
): boolean => {
  return !!(perms & p);
};
