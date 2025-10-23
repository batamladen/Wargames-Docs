## flag.py


This script is used for flag submittiong, saving progress.

```
# flag.py — Flask blueprint for flag submission and progress tracking

from flask import Blueprint, request, jsonify
import sqlite3
import jwt

# Flask blueprint — handles all /api/flags routes
flag_bp = Blueprint("flag", __name__, url_prefix="/api/flags")

DB_PATH = "<DB_PATH>"
JWT_SECRET = "<JWT_SECRET>"
JWT_ALGORITHM = "HS256"

# Import flag data mapping (series -> levels -> flags)
from levels import flag_map


# --- Database Helper ---
def get_db():
    """Creates and returns a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# --- Route: Submit Flag ---
@flag_bp.route("/submit", methods=["POST"])
def submit_flag():
    """
    Receives a submitted flag, verifies it, and records player progress.
    Requires a valid JWT token in the Authorization header.
    """

    # --- Authorization check ---
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"success": False, "message": "Missing authorization header"}), 401

    # Validate "Bearer <token>" format
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"success": False, "message": "Invalid authorization header"}), 401

    token = parts[1]
    try:
        # Decode the JWT to extract the username
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("username")
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    # --- Validate request body ---
    data = request.json
    series = data.get("series")
    level = str(data.get("level"))
    submitted_flag = data.get("flag")

    if not all([series, level, submitted_flag]):
        return jsonify({"success": False, "message": "Missing fields"}), 400

    # --- Check flag correctness ---
    correct_flag = flag_map.get(series, {}).get(level)
    if not correct_flag:
        return jsonify({"success": False, "message": "Invalid series or level"}), 400

    if submitted_flag != correct_flag:
        return jsonify({"success": False, "message": "Incorrect flag"}), 401

    # --- Database operations ---
    conn = get_db()
    cur = conn.cursor()

    # Prevent duplicate submissions
    cur.execute(
        "SELECT 1 FROM user_progress WHERE username = ? AND series = ? AND level = ?",
        (username, series, level)
    )
    if cur.fetchone():
        conn.close()
        return jsonify({"success": True, "message": "Already submitted"}), 200

    # Award aura points (example logic)
    aura_points = 10 if level == "0" else 20

    # Record progress in database
    cur.execute("""
        INSERT INTO user_progress (username, series, level, aura_points)
        VALUES (?, ?, ?, ?)
    """, (username, series, level, aura_points))

    conn.commit()
    conn.close()

    # Determine if this is the last level of the series
    all_levels = list(flag_map[series].keys())
    is_last = level == max(all_levels, key=int)

    # --- Response ---
    return jsonify({
        "success": True,
        "message": "Flag accepted",
        "aura_points": aura_points,
        "confetti": is_last  # used for celebration animation in frontend
    }), 200


# --- Route: Get User Progress ---
@flag_bp.route("/progress", methods=["GET"])
def get_progress():
    """
    Returns all completed levels for the authenticated user.
    Requires a valid JWT token.
    """

    # --- Authorization check ---
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"success": False, "message": "Missing authorization header"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"success": False, "message": "Invalid authorization header"}), 401

    token = parts[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("username")
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    # --- Fetch user progress ---
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT series, level FROM user_progress WHERE username = ?", (username,))
    rows = cur.fetchall()
    conn.close()

    # --- Response ---
    return jsonify({
        "success": True,
        "completed_levels": [{"series": r["series"], "level": int(r["level"])} for r in rows]
    })

```

