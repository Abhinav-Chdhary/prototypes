import time
import json
import logging
import redis
from fastapi import FastAPI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

def fetch_from_slow_api(city: str):
    logger.info(f"Fetching weather for {city} from slow API...")
    # Simulating a slow network call
    time.sleep(2) 
    
    # Simple dynamic mock data
    temp = 20 + (len(city) % 10) 
    return {
        "city": city.capitalize(), 
        "temp": temp, 
        "unit": "celsius", 
        "condition": "Partly Cloudy",
        "timestamp": time.time()
    }

@app.get("/weather/{city}")
async def get_weather(city: str):
    query_start_time = time.time()
    city_key = city.lower()
    
    # 1. Check the cache
    cached_data = r.get(city_key)
    
    if cached_data:
        logger.info(f"CACHE HIT for city: {city}")
        return {"source": "cache", "data": json.loads(cached_data), "response_time": time.time() - query_start_time}

    # 2. If Cache Miss, fetch from "API"
    logger.info(f"CACHE MISS for city: {city}")
    data = fetch_from_slow_api(city_key)

    # 3. Save to cache with an expiration (TTL) of 20 seconds
    r.setex(city_key, 20, json.dumps(data))

    return {"source": "api", "data": data, "response_time": time.time() - query_start_time}