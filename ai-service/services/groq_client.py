import os
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Fallback response
def fallback_response(reason="Groq API failed"):
    return {
        "summary": "AI service unavailable",
        "risk_level": "Medium",
        "next_step": "Try again later",
        "is_fallback": True,
        "reason": reason,
        "generated_at": datetime.now().isoformat()
    }

# Main Groq call
def call_groq(prompt):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=400
        )

        return {
            "result": response.choices[0].message.content,
            "is_fallback": False,
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        return fallback_response(str(e))