from flask import Blueprint, request, jsonify
from pathlib import Path
from datetime import datetime
import json

from services.groq_client import call_groq

# Create blueprint
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

    # Load prompt template
    prompt_template = Path("prompts/describe_prompt.txt").read_text()

    # Fill prompt
    prompt = prompt_template.format(
        title=data["title"],
        category=data["category"],
        due_date=data["due_date"],
        description=data["description"]
    )

    try:
        # Call AI
        ai_response = call_groq(prompt)

        # Try parsing JSON
        try:
            parsed_response = json.loads(ai_response)
        except json.JSONDecodeError:
            parsed_response = {
                "summary": ai_response,
                "risk_level": "Medium",
                "reason": "AI response was not valid JSON",
                "next_step": "Review manually"
            }

        # Add timestamp
        parsed_response["generated_at"] = datetime.utcnow().isoformat()

        return jsonify(parsed_response), 200

    except Exception as e:
        return jsonify({
            "summary": "AI failed",
            "risk_level": "Medium",
            "reason": str(e),
            "next_step": "Try again later",
            "generated_at": datetime.utcnow().isoformat(),
            "is_fallback": True
        }), 200