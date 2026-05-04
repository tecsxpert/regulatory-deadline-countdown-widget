from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/")
def home():
    return jsonify({
        "service": "tool87-ai-service",
        "message": "AI service placeholder is running"
    })


@app.get("/health")
def health():
    return jsonify({"status": "UP"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
