


## academy.py

```
# academy.py — Flask blueprint for the learning academy (paths, modules, lessons, quizzes, and aura points)

from flask import Blueprint, request, jsonify, g
import sqlite3
import jwt
from auth import DB_PATH, JWT_SECRET, JWT_ALGORITHM  # reuse constants safely

academy_bp = Blueprint("academy", __name__, url_prefix="/api/academy")


# -------------------------
# Database helper
# -------------------------
def get_db():
    """Get a SQLite connection stored in Flask's g object."""
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


# -------------------------
# Authentication decorator
# -------------------------
def auth_required(f):
    """Require JWT token in Authorization header to access route."""
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Missing or invalid token"}), 401
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.username = payload["username"]
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper


# -------------------------
# List all paths, modules, lessons, and tasks
# -------------------------
@academy_bp.route("/paths", methods=["GET"])
@auth_required
def get_paths():
    db = get_db()
    paths = db.execute("SELECT * FROM academy_paths").fetchall()
    result = []

    for path in paths:
        modules = db.execute("SELECT * FROM academy_modules WHERE path_id = ?", (path["id"],)).fetchall()
        module_list = []
        for module in modules:
            lessons = db.execute("SELECT * FROM academy_lessons WHERE module_id = ?", (module["id"],)).fetchall()
            lesson_list = []
            for lesson in lessons:
                tasks = db.execute("SELECT * FROM academy_tasks WHERE lesson_id = ?", (lesson["id"],)).fetchall()
                task_list = [{"id": t["id"], "name": t["name"], "description": t["description"]} for t in tasks]
                lesson_list.append({
                    "id": lesson["id"],
                    "name": lesson["name"],
                    "description": lesson["description"],
                    "tasks": task_list
                })
            module_list.append({
                "id": module["id"],
                "name": module["name"],
                "description": module["description"],
                "lessons": lesson_list
            })
        result.append({
            "id": path["id"],
            "name": path["name"],
            "description": path["description"],
            "modules": module_list
        })

    return jsonify({"success": True, "paths": result})


# -------------------------
# Complete a task
# -------------------------
@academy_bp.route("/complete_task", methods=["POST"])
@auth_required
def complete_task():
    data = request.json
    task_id = data.get("task_id")
    submitted_answer = data.get("answer")

    if not task_id:
        return jsonify({"success": False, "message": "task_id is required"}), 400
    if submitted_answer is None:
        return jsonify({"success": False, "message": "answer is required"}), 400

    db = get_db()

    # Get user ID
    user_row = db.execute("SELECT id FROM users WHERE username = ?", (request.username,)).fetchone()
    if not user_row:
        return jsonify({"success": False, "message": "User not found"}), 404
    user_id = user_row["id"]

    # Get task info
    task_row = db.execute("SELECT aura_points, correct_answer FROM academy_tasks WHERE id = ?", (task_id,)).fetchone()
    if not task_row:
        return jsonify({"success": False, "message": "Task not found"}), 404

    # Check answer correctness
    if str(submitted_answer).strip() != str(task_row["correct_answer"]).strip():
        return jsonify({"success": False, "message": "Incorrect answer"}), 400

    aura_points = task_row["aura_points"]

    # Mark task as completed
    db.execute(
        "INSERT OR REPLACE INTO academy_user_progress (user_id, task_id, completed) VALUES (?, ?, 1)",
        (user_id, task_id)
    )

    # Calculate total aura points from academy and wargames
    academy_total = db.execute(
        "SELECT COALESCE(SUM(t.aura_points),0) as total FROM academy_user_progress p "
        "JOIN academy_tasks t ON p.task_id = t.id WHERE p.user_id=? AND p.completed=1",
        (user_id,)
    ).fetchone()["total"]

    wargames_total = db.execute(
        "SELECT COALESCE(SUM(aura_points),0) as total FROM progress WHERE username = ? AND game != 'academy'",
        (request.username,)
    ).fetchone()["total"]

    total_aura = academy_total + wargames_total

    # Update global progress table
    db.execute(
        "INSERT INTO progress (username, game, level, aura_points) "
        "VALUES (?, 'academy', ?, ?) "
        "ON CONFLICT(username, game, level) DO UPDATE SET aura_points = excluded.aura_points",
        (request.username, f"task_{task_id}", aura_points)
    )

    db.commit()

    return jsonify({
        "success": True,
        "message": "Task marked completed",
        "aura_points_awarded": aura_points,
        "total_aura_points": total_aura
    })


# -------------------------
# Get user progress with completion status
# -------------------------
@academy_bp.route("/progress", methods=["GET"])
@auth_required
def get_progress():
    db = get_db()
    user_row = db.execute("SELECT id FROM users WHERE username = ?", (request.username,)).fetchone()
    if not user_row:
        return jsonify({"success": False, "message": "User not found"}), 404
    user_id = user_row["id"]

    paths = db.execute("SELECT * FROM academy_paths").fetchall()
    result = []

    for path in paths:
        modules = db.execute("SELECT * FROM academy_modules WHERE path_id = ?", (path["id"],)).fetchall()
        module_list = []
        path_completed = True
        for module in modules:
            lessons = db.execute("SELECT * FROM academy_lessons WHERE module_id = ?", (module["id"],)).fetchall()
            lesson_list = []
            module_completed = True
            for lesson in lessons:
                # Determine if all quiz questions are completed
                questions = db.execute("SELECT id FROM academy_questions WHERE lesson_id = ?", (lesson["id"],)).fetchall()
                if not questions:
                    lesson_completed = False
                else:
                    placeholders = ",".join("?" * len(questions))
                    completed_questions = db.execute(
                        f"SELECT COUNT(*) as c FROM academy_quiz_submissions WHERE user_id=? "
                        f"AND question_id IN ({placeholders}) AND is_correct=1",
                        [user_id] + [q["id"] for q in questions]
                    ).fetchone()["c"]
                    lesson_completed = completed_questions == len(questions)

                if not lesson_completed:
                    module_completed = False
                    path_completed = False
                lesson_list.append({"id": lesson["id"], "name": lesson["name"], "completed": lesson_completed})
            module_list.append({"id": module["id"], "name": module["name"], "completed": module_completed, "lessons": lesson_list})
        result.append({"id": path["id"], "name": path["name"], "completed": path_completed, "modules": module_list})

    return jsonify({"success": True, "paths": result})


# -------------------------
# Get completion percentages
# -------------------------
@academy_bp.route("/progress_percentage", methods=["GET"])
@auth_required
def progress_percentage():
    db = get_db()
    user_row = db.execute("SELECT id FROM users WHERE username = ?", (request.username,)).fetchone()
    user_id = user_row["id"]

    total_tasks = db.execute("SELECT COUNT(*) as total FROM academy_questions").fetchone()["total"]
    completed_tasks = db.execute(
        "SELECT COUNT(DISTINCT question_id) as completed FROM academy_quiz_submissions WHERE user_id=? AND is_correct=1",
        (user_id,)
    ).fetchone()["completed"]

    percentage = int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
    return jsonify({"success": True, "completed_percentage": percentage})


# -------------------------
# Get total aura points
# -------------------------
@academy_bp.route("/academy_aura_points", methods=["GET"])
@auth_required
def get_academy_aura_points():
    db = get_db()
    try:
        user_row = db.execute("SELECT id FROM users WHERE username = ?", (request.username,)).fetchone()
        if not user_row:
            return jsonify({"success": False, "message": "User not found"}), 404
        user_id = user_row["id"]

        row = db.execute(
            "SELECT COALESCE(SUM(aura_awarded), 0) AS academy_aura "
            "FROM academy_quiz_submissions WHERE user_id = ? AND is_correct = 1",
            (user_id,)
        ).fetchone()

        academy_aura = row["academy_aura"] if row and "academy_aura" in row.keys() else 0
        return jsonify({"success": True, "academy_aura": academy_aura})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# -------------------------
# Quiz endpoints
# -------------------------

# Get all quiz questions for a lesson
@academy_bp.route("/lesson/<int:lesson_id>/questions", methods=["GET"])
@auth_required
def get_lesson_questions(lesson_id):
    db = get_db()
    questions = db.execute("SELECT * FROM academy_questions WHERE lesson_id = ?", (lesson_id,)).fetchall()
    result = []
    for q in questions:
        answers = db.execute

```