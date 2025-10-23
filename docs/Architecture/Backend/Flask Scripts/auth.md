

The login and registrations system are planned to change. This current solution was used because the goal was just to make it work. Now, we improve.

> NOTE: We plan to migrate to Super Tokens authentication solution.


## auth.py

The auth.py is used for login and registration, scoreboard fetch, fetch aura points

```
# auth.py — Flask blueprint for user registration, login, flag submission, and progress

from flask import Blueprint, request, jsonify
import sqlite3
import bcrypt
import jwt
import datetime

# Flask blueprint — handles all /api/auth routes
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# --- Configuration ---
DB_PATH = "<DB_PATH>"  # Path to SQLite database
JWT_SECRET = "<JWT_SECRET>"  # Replace with a secure secret
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3600 * 24  # Token valid for 1 day


# --- Helper function ---
def get_db():
    """Returns a SQLite connection with row access by column name."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# --- Route: User Registration ---
@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new user with username, email, and password.
    Passwords are hashed using bcrypt.
    """
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"success": False, "message": "Username, email and password required"}), 400

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    conn = get_db()
    cur = conn.cursor()

    try:
        # Prevent duplicate usernames or emails
        cur.execute("SELECT 1 FROM users WHERE username = ? OR email = ?", (username, email))
        if cur.fetchone():
            return jsonify({"success": False, "message": "Username or email already exists"}), 409

        # Insert new user
        cur.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", 
                    (username, email, hashed_pw))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Username or email already exists"}), 409
    finally:
        conn.close()

    return jsonify({"success": True, "message": "User registered successfully"}), 201


# --- Route: User Login ---
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticates a user and returns a JWT token for subsequent requests.
    """
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

    password_hash = row["password_hash"]

    if not bcrypt.checkpw(password.encode(), password_hash):
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

    # Generate JWT token
    payload = {
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({"success": True, "token": token}), 200


# --- Route: Submit Flag ---
@auth_bp.route("/submit", methods=["POST"])
def submit_flag():
    """
    Authenticated route for submitting flags.
    Updates user progress and awards aura points.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"success": False, "message": "Missing or invalid token"}), 401

    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload["username"]
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    # Validate input
    data = request.json
    game = data.get("game")
    level = data.get("level")
    submitted_flag = data.get("flag")

    if not game or not level or not submitted_flag:
        return jsonify({"success": False, "message": "Missing game, level or flag"}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        # Fetch level info
        cur.execute("SELECT flag, aura_points FROM levels WHERE game = ? AND level = ?", (game, level))
        level_data = cur.fetchone()
        if not level_data:
            return jsonify({"success": False, "message": "Level not found"}), 404

        correct_flag = level_data["flag"]
        if submitted_flag.strip() != correct_flag.strip():
            return jsonify({"success": False, "message": "Incorrect flag"}), 403

        # Check if already completed
        cur.execute("SELECT 1 FROM progress WHERE username = ? AND game = ? AND level = ?", 
                    (username, game, level))
        if cur.fetchone():
            return jsonify({
                "success": True,
                "message": "Flag already submitted",
                "aura_points": 0,
                "game": game,
                "level": level
            })

        # Insert new completion
        aura_points = level_data["aura_points"] or 10
        cur.execute("INSERT INTO progress (username, game, level, aura_points) VALUES (?, ?, ?, ?)",
                    (username, game, level, aura_points))
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Correct flag!",
            "aura_points": aura_points,
            "game": game,
            "level": level
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


# --- Route: Get User Progress ---
@auth_bp.route("/myprogress", methods=["GET"])
def my_progress():
    """
    Returns all progress for the authenticated user.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"success": False, "message": "Missing or invalid token"}), 401

    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload["username"]

        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT game, level FROM progress WHERE username = ? ORDER BY game, level", (username,))
        progress = [{"series": row["game"], "level": row["level"].replace("level", "")} for row in cur.fetchall()]

        return jsonify({"success": True, "progress": progress}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


# --- Route: Get Total Aura Points ---
@auth_bp.route("/aura_points", methods=["GET"])
def get_aura_points():
    """
    Returns total aura points from challenges and academy tasks.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"success": False, "message": "Missing or invalid token"}), 401

    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload["username"]

        conn = get_db()
        cur = conn.cursor()

        # Aura from challenges
        cur.execute("SELECT COALESCE(SUM(aura_points), 0) as challenge_aura FROM progress WHERE username = ?", (username,))
        challenge_aura = cur.fetchone()["challenge_aura"]

        # Aura from academy tasks
        cur.execute("""
            SELECT COALESCE(SUM(at.aura_points), 0) as academy_aura
            FROM academy_user_progress ap
            JOIN users u ON ap.user_id = u.id
            JOIN academy_tasks at ON ap.task_id = at.id
            WHERE u.username = ? AND ap.completed = 1
        """, (username,))
        academy_aura = cur.fetchone()["academy_aura"]

        total = challenge_aura + academy_aura
        return jsonify({"success": True, "total_aura": total}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


# --- Route: Scoreboard ---
@auth_bp.route("/scoreboard", methods=["GET"])
def get_scoreboard():
    """
    Returns a leaderboard of users sorted by total aura points.
    """
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT username, COALESCE(SUM(aura_points),0) AS aura_points FROM progress GROUP BY username ORDER BY aura_points DESC")
        rows = cur.fetchall()
        scoreboard = [{"username": row["username"], "aura_points": row["aura_points"] or 0} for row in rows]
        return jsonify(scoreboard), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

```