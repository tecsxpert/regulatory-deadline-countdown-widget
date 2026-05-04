import requests

# 🔑 Direct key (since your key works now)
api_key = ""
url = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "llama-3.3-70b-versatile",  # ✅ updated model
    "messages": [
        {"role": "user", "content": "Explain regulatory deadlines in 2 simple lines"}
    ],
    "temperature": 0.5,
    "max_tokens": 100
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()
    print("\n✅ AI Response:")
    print(result["choices"][0]["message"]["content"])
else:
    print("❌ Error:", response.status_code)
    print(response.text)