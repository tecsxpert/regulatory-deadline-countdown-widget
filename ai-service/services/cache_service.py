import json
import hashlib
import time
from threading import Lock

# Simple in-memory cache with TTL and thread safety
class MemoryCache:
    def __init__(self):
        self.cache = {}
        self.lock = Lock()
        self.ttl = 15 * 60  # 15 minutes

    def make_key(self, data):
        """Create cache key from data dictionary"""
        raw = json.dumps(data, sort_keys=True)
        return hashlib.sha256(raw.encode()).hexdigest()

    def get(self, key):
        """Get value from cache by key"""
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                # Check if expired
                if time.time() < entry['expires_at']:
                    return entry['data']
                else:
                    del self.cache[key]
            return None

    def set(self, key, data):
        """Set value in cache with TTL"""
        with self.lock:
            self.cache[key] = {
                'data': data,
                'expires_at': time.time() + self.ttl
            }

# Global cache instance
cache = MemoryCache()

def make_cache_key(data):
    """Create cache key from data dictionary"""
    return cache.make_key(data)

def get_cache(cache_key):
    """Get value from cache by key"""
    return cache.get(cache_key)

def set_cache(cache_key, data):
    """Set value in cache with TTL"""
    cache.set(cache_key, data)