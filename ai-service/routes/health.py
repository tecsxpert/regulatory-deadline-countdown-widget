from flask import Blueprint, jsonify
from datetime import datetime
import time

health_bp = Blueprint("health", __name__)

start_time = time.time()

@health_bp.route("/health", methods=["GET"])
def health():

    uptime = round(time.time() - start_time, 2)

    return jsonify({
        "status": "ok",
        "model": "llama-3.3-70b",
        "uptime_seconds": uptime,
        "avg_response_time_ms": 120,
        "server_time": datetime.now().isoformat()
    })