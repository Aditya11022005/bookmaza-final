class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Sets a cache entry.
   * @param {string} key - Cache key.
   * @param {any} value - Value to store.
   * @param {number} ttlMs - Time-to-live in milliseconds (default 5 minutes).
   */
  set(key, value, ttlMs = 300000) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Gets a cache entry. Returns null if expired or missing.
   * @param {string} key - Cache key.
   * @returns {any|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Deletes a specific cache entry.
   * @param {string} key - Cache key.
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clears all cache entries.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clears cache entries starting with a specific prefix.
   * @param {string} prefix - Key prefix.
   */
  clearPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();
