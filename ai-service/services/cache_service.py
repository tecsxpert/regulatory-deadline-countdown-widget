import os
import json
import hashlib
import redis

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

CACHE_TTL = 15 * 60

def make_cache_key(data):
    """Create cache key from data dictionary"""
    raw = json.dumps(data, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()

def get_cache(cache_key):
    """Get value from cache by key"""
    try:
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        return None
    except Exception:
        return None

def set_cache(cache_key, data):
    """Set value in cache with TTL"""
    try:
        redis_client.setex(cache_key, CACHE_TTL, json.dumps(data))
    except Exception:
        pass