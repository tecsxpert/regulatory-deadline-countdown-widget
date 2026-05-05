import requests

BASE_URL = "http://localhost:5000"

payload = {
    "text": "GST return filing deadline is 20 May 2026"
}

for endpoint in ["/health", "/describe", "/recommend"]:
    try:
        if endpoint == "/health":
            response = requests.get(BASE_URL + endpoint)
        else:
            response = requests.post(BASE_URL + endpoint, json=payload)

        print(endpoint)
        print(response.status_code)
        print(response.json())
        print("-" * 40)

    except Exception as e:
        print(endpoint, "failed:", e)