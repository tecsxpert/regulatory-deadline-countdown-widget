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


routes/
services/
prompts/
app.py
requirements.txt
Dockerfile
.env.example
README.md
# AI Service — Regulatory Deadline Countdown Widget

## Project Overview

This is the AI microservice for the Regulatory Deadline Countdown Widget capstone project.

The AI service is built using Flask and Groq LLaMA models. It provides AI-powered features such as:

- AI-generated deadline descriptions
- Smart recommendations
- AI report generation
- Health monitoring endpoint

The service runs on port 5000 and connects with the Spring Boot backend.

---

# Tech Stack

- Python 3.11
- Flask 3.x
- Groq API (LLaMA 3.3)
- Redis
- Docker

---

# Folder Structure

```txt
ai-service/
│
├── routes/
├── services/
├── prompts/
├── screenshots/
├── app.py
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

# Environment Variables

Create a `.env` file inside `ai-service/`

Example:

```env
GROQ_API_KEY=your_groq_api_key
REDIS_HOST=localhost
REDIS_PORT=6379
FLASK_ENV=development
```

---

# Installation

## Create Virtual Environment

```bash
python -m venv .venv
```

## Activate Virtual Environment

### Windows

```bash
.venv\Scripts\activate
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Run Locally

```bash
python app.py
```

Service runs at:

```txt
http://localhost:5000
```

---

# API Endpoints

## Health Check

```http
GET /health
```

Example:

```txt
http://localhost:5000/health
```

---

## Describe Endpoint

```http
POST /describe
```

Example Request:

```json
{
  "title": "GST Return Deadline",
  "category": "Tax",
  "due_date": "2026-05-10",
  "description": "Company GST filing submission deadline"
}
```

---

## Recommend Endpoint

```http
POST /recommend
```

Example Request:

```json
{
  "title": "GST Return Deadline",
  "category": "Tax",
  "due_date": "2026-05-10",
  "priority": "High"
}
```

---

## Generate Report Endpoint

```http
POST /generate-report
```

Example Request:

```json
{
  "text": "GST Return Deadline. Category: Tax. Due date: 2026-05-10. Status: Pending."
}
```

---

# Docker Setup

## Build Docker Image

```bash
docker build -t ai-service .
```

## Run Docker Container

```bash
docker run -p 5000:5000 ai-service
```

---

# requirements.txt

```txt
Flask==3.0.3
groq==0.5.0
python-dotenv==1.0.1
flask-limiter==3.5.0
redis==5.0.4
requests==2.31.0
```

---

# Features

- AI-powered deadline analysis
- Recommendation generation
- AI report generation
- Error handling
- Health monitoring
- Redis caching support
- Docker support

---

# Security Features

- Input validation
- Error handling
- Prompt injection protection
- Rate limiting
- Environment variable protection

---

# Screenshots

Screenshots are stored inside:

```txt
screenshots/
```

---

# Author

AI Developer 1  
Regulatory Deadline Countdown Widget Capstone Project

---

# Status

```txt
Day 15 — AI Service Documentation Completed
```
