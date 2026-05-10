from datetime import datetime

def fallback_response(text=""):
    return {
        "summary": f"AI service temporarily unavailable. Basic response for: {text}",
        "recommendations": [
            {
                "action_type": "Reminder",
                "description": "Check the deadline manually and set a reminder.",
                "priority": "High"
            }
        ],
        "generated_at": datetime.now().isoformat(),
        "is_fallback": True
    }