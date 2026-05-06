# AI Service - Regulatory Deadline Countdown Widget
## Setup

pip install -r requirements.txt

python app.py
## .env

GROQ_API_KEY=your_api_key


GET /health

POST /describe
   {
  "title": "GST Filing",
  "deadline": "2026-05-10"
}
POST /recommend

POST /generate-report

http://localhost:5000