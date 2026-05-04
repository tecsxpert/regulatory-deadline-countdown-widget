from flask import (
    Flask,
    request,
    jsonify,
    render_template,
    send_file,
    redirect,
    url_for,
    session
)
from datetime import datetime
import logging
import json
import os

from services.groq_client import GroqClient
from security.guard import (
    detect_prompt_injection,
    rate_limit,
    validate_input,
    remove_pii
)

app = Flask(__name__)
app.secret_key = "change-this-secret-key"

client = GroqClient()

logging.basicConfig(
    filename="logs/app.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s"
)

HISTORY_FILE = "data/history.json"

USERNAME = "admin"
PASSWORD = "admin123"


def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []

    try:
        with open(HISTORY_FILE, "r") as file:
            content = file.read().strip()

            if not content:
                return []

            return json.loads(content)

    except json.JSONDecodeError:
        return []


def save_history(data):
    with open(HISTORY_FILE, "w") as file:
        json.dump(data, file, indent=2)


def is_logged_in():
    return session.get("logged_in") is True


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    data = request.form

    username = data.get("username")
    password = data.get("password")

    if username == USERNAME and password == PASSWORD:
        session["logged_in"] = True
        return redirect(url_for("home"))

    return render_template(
        "login.html",
        error="Invalid username or password"
    )


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
def home():
    if not is_logged_in():
        return redirect(url_for("login"))

    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input provided"}), 400

    prompt = data.get("prompt", "")
    ip = request.remote_addr

    if not validate_input(prompt):
        return jsonify({"error": "Empty input"}), 400

    if detect_prompt_injection(prompt):
        return jsonify({"error": "Prompt injection detected"}), 400

    if not rate_limit(ip):
        return jsonify({"error": "Rate limit exceeded"}), 429

    safe_prompt = remove_pii(prompt)

    logging.info(f"AI request from {ip}: {safe_prompt}")

    try:
        result = client.generate(safe_prompt)
        return jsonify({"response": result})
    except Exception:
        return jsonify({"response": "AI service unavailable"})


@app.route("/deadline", methods=["POST"])
def deadline():
    if not is_logged_in():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    if not data:
        return jsonify({"error": "No input provided"}), 400

    deadline_date = data.get("date", "")

    if not deadline_date:
        return jsonify({"error": "Date required"}), 400

    try:
        target = datetime.strptime(deadline_date, "%Y-%m-%d").date()
        today = datetime.today().date()

        days_left = (target - today).days

        if days_left > 0:
            status = "upcoming"
        elif days_left == 0:
            status = "due today"
        else:
            status = "overdue"

        if days_left < 0:
            priority = "expired"
        elif days_left <= 7:
            priority = "high"
        elif days_left <= 30:
            priority = "medium"
        else:
            priority = "low"

        result = {
            "date": deadline_date,
            "days_left": days_left,
            "status": status,
            "priority": priority
        }

        history = load_history()
        history.append(result)
        save_history(history)

        return jsonify(result)

    except ValueError:
        return jsonify({
            "error": "Use YYYY-MM-DD format"
        }), 400


@app.route("/history", methods=["GET"])
def history():
    if not is_logged_in():
        return jsonify({"error": "Unauthorized"}), 401

    history = load_history()

    priority = request.args.get("priority")
    start_date = request.args.get("start")
    end_date = request.args.get("end")

    if priority:
        history = [
            item for item in history
            if item.get("priority") == priority
        ]

    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            end = datetime.strptime(end_date, "%Y-%m-%d").date()

            history = [
                item for item in history
                if start <= datetime.strptime(
                    item["date"], "%Y-%m-%d"
                ).date() <= end
            ]

        except ValueError:
            return jsonify({
                "error": "Invalid date format. Use YYYY-MM-DD"
            }), 400

    return jsonify(history)


@app.route("/export", methods=["GET"])
def export():
    if not is_logged_in():
        return jsonify({"error": "Unauthorized"}), 401

    history = load_history()

    filename = "deadline_history.csv"

    with open(filename, "w", newline="") as file:
        file.write("date,days_left,status,priority\n")

        for item in history:
            file.write(
                f"{item['date']},"
                f"{item['days_left']},"
                f"{item['status']},"
                f"{item['priority']}\n"
            )

    return send_file(filename, as_attachment=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)