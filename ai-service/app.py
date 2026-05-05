from flask import Flask, jsonify
from routes.describe import describe_bp
from routes.recommend import recommend_bp   # ✅ ADD THIS

app = Flask(__name__)

# Register routes
app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)   # ✅ ADD THIS

# Health check
@app.route("/health")
def health():
    return jsonify({
        "service": "ai-service",
        "status": "ok"
    })

# Home route
@app.route("/")
def home():
    return jsonify({
        "message": "AI service running",
        "endpoints": ["/health", "/describe", "/recommend"]  # ✅ update
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)

if __name__ == "__main__":
    app.run(debug=True, port=5000)