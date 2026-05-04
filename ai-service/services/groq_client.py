import requests
import time

api_key = ""
class GroqClient:

    def generate(self, prompt):

        if not prompt or prompt.strip() == "":
            return "Invalid input"

        url = "https://api.groq.com/openai/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        for i in range(3):
            try:
                response = requests.post(url, headers=headers, json=data)

                print("Status:", response.status_code)

                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    print("Error:", response.text)

            except Exception as e:
                print("Exception:", e)

            time.sleep(2)

        return "AI service unavailable"