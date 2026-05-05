from flask import Flask, jsonify
from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.generate_report import generate_report_bp   # ✅ NEW

app = Flask(__name__)

# Register routes
app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(generate_report_bp)   # ✅ NEW

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
        "endpoints": [
            "/health",
            "/describe",
            "/recommend",
            "/generate-report"   # ✅ NEW
        ]
    })

# Run app (ONLY ONCE)
if __name__ == "__main__":
    app.run(port=5000, debug=True)