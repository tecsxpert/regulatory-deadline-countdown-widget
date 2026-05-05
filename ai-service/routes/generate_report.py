from flask import Blueprint, request, jsonify
from datetime import datetime

generate_report_bp = Blueprint("generate_report", __name__)

@generate_report_bp.route("/generate-report", methods=["POST"])
def generate_report():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "text is required"}), 400

    text = data["text"]

    report = {
        "title": "Regulatory Deadline Report",
        "summary": f"Report generated for: {text}",
        "overview": "This report explains the important deadline, risk level, and required actions.",
        "key_items": [
            "Check the regulatory deadline",
            "Verify required documents",
            "Complete submission before due date"
        ],
        "recommendations": [
            {
                "action_type": "Reminder",
                "description": "Set reminder 7 days before the deadline",
                "priority": "High"
            },
            {
                "action_type": "Review",
                "description": "Review all compliance documents",
                "priority": "Medium"
            },
            {
                "action_type": "Submit",
                "description": "Submit before the final deadline",
                "priority": "High"
            }
        ],
        "generated_at": datetime.now().isoformat(),
        "is_fallback": False
    }

    return jsonify(report), 200