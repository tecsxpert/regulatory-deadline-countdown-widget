from flask import Blueprint, request, jsonify
from datetime import datetime

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body is required"}), 400

    title = data.get("title", "")
    deadline = data.get("deadline", "")
    status = data.get("status", "")

    recommendations = [
        {
            "action_type": "review",
            "description": f"Review {title} before deadline.",
            "priority": "High"
        },
        {
            "action_type": "reminder",
            "description": f"Set reminder before {deadline}.",
            "priority": "Medium"
        },
        {
            "action_type": "follow_up",
            "description": f"Track status: {status}",
            "priority": "Low"
        }
    ]

    return jsonify({
        "generated_at": datetime.utcnow().isoformat(),
        "recommendations": recommendations
    })