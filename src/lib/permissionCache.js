const permissionCache = new Map();

const TTL = 5 * 60 * 1000; // 5 minutes

export function getPermissionCache(userId) {
  const data = permissionCache.get(String(userId));

  if (!data) return null;

  if (Date.now() > data.expireAt) {
    permissionCache.delete(String(userId));
    return null;
  }

  return data.permissions;
}

export function setPermissionCache(userId, permissions) {
  permissionCache.set(String(userId), {
    permissions,

    expireAt: Date.now() + TTL,
  });
}

export function clearPermissionCache(userId) {
  permissionCache.delete(String(userId));
}
