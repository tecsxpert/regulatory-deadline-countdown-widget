from services.model_loader import model
from flask import Flask, jsonify
from flask_talisman import Talisman

from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.health import health_bp
from routes.generate_report import generate_report_bp

app = Flask(__name__)

# Security Headers
Talisman(
    app,
    force_https=False,
    content_security_policy={
        "default-src": "'self'"
    }
)

@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# Register Blueprints
app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(health_bp)
app.register_blueprint(generate_report_bp)

@app.route("/")
def home():
    return jsonify({
        "message": "AI service running",
        "endpoints": [
            "/health",
            "/describe",
            "/recommend",
            "/generate-report"
        ]
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)