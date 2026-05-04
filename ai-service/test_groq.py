import os
import requests
from dotenv import load_dotenv

# Force load .env
load_dotenv(dotenv_path="./.env")

# Get API key
api_key = os.getenv("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")

print("Loaded Key:", api_key)

if not api_key:
    print("❌ ERROR: API key not loaded. Check .env file")
    exit()

print("✅ API Key Loaded")

# API endpoint
url = "https://api.groq.com/openai/v1/chat/completions"

# Headers
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Request body
data = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "user", "content": "Explain regulatory deadlines in 2 simple lines"}
    ],
    "temperature": 0.5,
    "max_tokens": 100
}

try:
    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        ai_text = result["choices"][0]["message"]["content"]

        print("\n✅ AI Response:")
        print(ai_text)

    else:
        print("❌ Error Status:", response.status_code)
        print("❌ Error Response:", response.text)

except Exception as e:
    print("❌ Exception:", str(e))