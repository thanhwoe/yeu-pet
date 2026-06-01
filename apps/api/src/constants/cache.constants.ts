export const CACHEABLE_KEY = 'cacheable';
export const CACHE_TTL_KEY = 'cache_ttl';
export const CACHE_EVICT_PATTERNS_KEY = 'cache_evict_patterns';
export const IGNORE_CACHE_KEY = 'ignore_cache';

export const HTTP_CACHE_PREFIX = 'http_cache';

export const CACHE_KEY = {
  USER_BY_ID: (id: string) => `user:${id}`,
  PET_BY_ID: (id: string) => `pet:${id}`,
  SLOT_BY_ID: (id: string) => `slot:${id}`,
  SERVICE_BY_ID: (id: string) => `service:${id}`,
  BOOKING_BY_ID: (id: string) => `booking:${id}`,
  REMINDER_BY_ID: (id: string) => `reminder:${id}`,
};

export const CACHE_TTL = {
  USER: 60,
  PET: 60,
  SLOT: 60,
  SERVICE: 300,
  BOOKING: 30,
  REMINDER: 60,
};
