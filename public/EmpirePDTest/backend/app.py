from flask import Flask, request, jsonify
from flask_cors import CORS

from pd_importer import import_characters


# ============================================================
# APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "success": True,
        "service": "Empire Companion Backend",
        "pd_importer": True
    })


# ============================================================
# PROFUND DECISIONS LOGIN + IMPORT
# ============================================================

@app.route("/api/pd/login", methods=["POST"])
def pd_login():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "error": "Request must contain JSON"
        }), 400

    login_name = data.get("login")
    password = data.get("password")

    if not login_name:
        return jsonify({
            "success": False,
            "error": "PD login is required"
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "error": "PD password is required"
        }), 400

    try:

        result = import_characters(
            login_name,
            password
        )

        return jsonify({
            "success": True,
            **result
        })

    except Exception as error:

        print()
        print("=" * 60)
        print("PD IMPORT ERROR")
        print("=" * 60)
        print(str(error))
        print("=" * 60)
        print()

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# ============================================================
# ROOT
# ============================================================

@app.route("/", methods=["GET"])
def index():

    return jsonify({
        "service": "Empire Companion Backend",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "pd_login": "/api/pd/login"
        }
    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("       EMPIRE COMPANION BACKEND")
    print("=" * 60)
    print()
    print("Backend running at:")
    print()
    print("http://127.0.0.1:5000")
    print()
    print("Health check:")
    print()
    print("http://127.0.0.1:5000/api/health")
    print()
    print("Press CTRL+C to stop.")
    print()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )