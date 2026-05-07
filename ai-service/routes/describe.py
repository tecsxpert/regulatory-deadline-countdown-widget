from services.fallback import fallback_response
from flask import Blueprint, request, jsonify
from pathlib import Path
from datetime import datetime
import json

from services.groq_client import call_groq
from services.cache_service import make_cache_key, get_cache, set_cache

describe_bp = Blueprint("describe", __name__)

@describe_bp.route("/describe", methods=["POST"])
def describe():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    required_fields = ["title", "category", "due_date", "description"]

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field} is required"}), 400

    # Redis cache check
    cache_key = make_cache_key({
        "endpoint": "describe",
        "title": data["title"],
        "category": data["category"],
        "due_date": data["due_date"],
        "description": data["description"]
    })

    cached_response = get_cache(cache_key)
    if cached_response:
        cached_response["cached"] = True
        return jsonify(cached_response), 200

    prompt_template = Path("prompts/describe_prompt.txt").read_text()

    prompt = prompt_template.format(
        title=data["title"],
        category=data["category"],
        due_date=data["due_date"],
        description=data["description"]
    )

    try:
        ai_response = call_groq(prompt)

        if ai_response.get("is_fallback"):
            parsed_response = ai_response
        else:
            try:
                parsed_response = json.loads(ai_response["result"])
            except json.JSONDecodeError:
                parsed_response = {
                    "summary": ai_response["result"],
                    "risk_level": "Medium",
                    "reason": "AI response was not valid JSON",
                    "next_step": "Review manually"
                }

        parsed_response["generated_at"] = datetime.utcnow().isoformat()
        parsed_response["cached"] = False

        set_cache(cache_key, parsed_response)

        return jsonify(parsed_response), 200

    except Exception as e:
        return jsonify({
            "summary": "AI failed",
            "risk_level": "Medium",
            "reason": str(e),
            "next_step": "Try again later",
            "generated_at": datetime.utcnow().isoformat(),
            "is_fallback": True,
            "cached": False
        }), 200