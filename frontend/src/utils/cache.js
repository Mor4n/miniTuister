// Sistema de caché simple para optimizar el rendimiento
class SimpleCache {
  constructor(ttl = 300000) { // TTL por defecto: 5 minutos
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Verificar si el caché ha expirado
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  has(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    // Verificar si el caché ha expirado
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

// Instancias de caché para diferentes tipos de datos
export const tweetsCache = new SimpleCache(60000); // 1 minuto para tweets
export const profilesCache = new SimpleCache(300000); // 5 minutos para perfiles
export const likesCache = new SimpleCache(30000); // 30 segundos para likes

export default SimpleCache;