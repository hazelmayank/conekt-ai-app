interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  defaultTTL: number; // in milliseconds
  maxSize: number;
  enableLogging: boolean;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enableLogging: __DEV__,
      ...config
    };
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const itemTTL = ttl || this.config.defaultTTL;
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: itemTTL
    });

    if (this.config.enableLogging) {
      console.log(`📦 Cache SET: ${key} (TTL: ${itemTTL}ms)`);
    }
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      if (this.config.enableLogging) {
        console.log(`📦 Cache MISS: ${key}`);
      }
      return null;
    }
    
    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      if (this.config.enableLogging) {
        console.log(`📦 Cache EXPIRED: ${key}`);
      }
      return null;
    }
    
    if (this.config.enableLogging) {
      console.log(`📦 Cache HIT: ${key} (age: ${now - cached.timestamp}ms)`);
    }
    
    return cached.data;
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (this.config.enableLogging && deleted) {
      console.log(`📦 Cache DELETE: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    if (this.config.enableLogging) {
      console.log(`📦 Cache CLEARED`);
    }
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      keys: Array.from(this.cache.keys())
    };
  }

  // Cache with automatic key generation
  cacheWithKey<T>(
    prefix: string,
    params: Record<string, any>,
    data: T,
    ttl?: number
  ): void {
    const key = this.generateKey(prefix, params);
    this.set(key, data, ttl);
  }

  getWithKey<T>(
    prefix: string,
    params: Record<string, any>
  ): T | null {
    const key = this.generateKey(prefix, params);
    return this.get<T>(key);
  }

  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key] || '')}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }
}

// Create different cache instances for different data types
export const citiesCache = new CacheService({
  defaultTTL: 10 * 60 * 1000, // 10 minutes - cities don't change often
  maxSize: 50
});

export const trucksCache = new CacheService({
  defaultTTL: 2 * 60 * 1000, // 2 minutes - trucks update more frequently
  maxSize: 200
});

export const campaignsCache = new CacheService({
  defaultTTL: 1 * 60 * 1000, // 1 minute - campaigns change frequently
  maxSize: 100
});

export const videosCache = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes - videos are relatively static
  maxSize: 100
});

export const generalCache = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 50
});

export default CacheService;
