from flask import Flask, jsonify, request
import time
import hashlib
import json

app = Flask(__name__)

start_time = time.time()
ai_cache = {}

def make_cache_key(data):
    return hashlib.sha256(
        json.dumps(data, sort_keys=True).encode()
    ).hexdigest()

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "ai-service",
        "status": "ok",
        "model": "llama-3.3-70b",
        "uptime_seconds": round(time.time() - start_time, 2),
        "cache": "in-memory-temporary"
    })

@app.route("/describe", methods=["POST"])
def describe():
    data = request.get_json()

    key = make_cache_key(data)

    if key in ai_cache:
        return jsonify({
            **ai_cache[key],
            "from_cache": True
        })

    result = {
        "summary": "AI generated description here",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "from_cache": False
    }

    ai_cache[key] = result
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5000, debug=True)