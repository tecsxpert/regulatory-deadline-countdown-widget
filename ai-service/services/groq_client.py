import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Lazy initialization of Groq client
_client = None

def _get_client():
    global _client
    if _client is None:
        try:
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY not set in environment")
            _client = Groq(api_key=api_key)
        except Exception as e:
            print(f"Warning: Could not initialize Groq client: {e}")
            return None
    return _client

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
        client = _get_client()
        if client is None:
            return fallback_response("Groq client not initialized")
        
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