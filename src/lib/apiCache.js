// Simple in-memory cache for Next route handlers.
// Helps reduce repeated DB hits for read endpoints.
// Note: Cache is per server instance (not shared across multiple instances).

const store = new Map();

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value, ttlMs) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function makeCacheKey(prefix, request, extra = "") {
  // Include pathname + search params to differentiate requests.
  const url = new URL(request.url);
  const search = url.searchParams.toString();
  return `${prefix}:${url.pathname}?${search}:${extra}`;
}

