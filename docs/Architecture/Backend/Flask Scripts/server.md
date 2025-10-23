## server.py



```
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import sqlite3

app = Flask(__name__)
CORS(app)

DB_PATH = "<DB_PATH>"

username_map = {
    "shadows": {
        "0": "the-shadows_level0",
        "1": "the-shadows_level1",
        "2": "the-shadows_level2",
        "3": "the-shadows_level3",
        "4": "the-shadows_level4",
        "5": "the-shadows_level5",
        "6": "the-shadows_level6",
        "7": "the-shadows_level7",
        "8": "the-shadows_level8",
        "9": "the-shadows_level9",
    },
    "tunnel": {
        "0": "tunnel_level0",
        "1": "tunnel_level1",
    },
    "jugsaw": {
        "0": "jugsaw_level0",
        "1": "jugsaw_level1",
        "2": "jugsaw_level2",
        "3": "jugsaw_level3",
        "4": "jugsaw_level4",
        "5": "jugsaw_level5",
        "6": "jugsaw_level6",
        "7": "jugsaw_level7",
        "8": "jugsaw_level8",
        "9": "jugsaw_level9",
        "10": "jugsaw_level10",
    }

}

password_map = {
    "shadows": {
        "0": "<password>",
        "1": "<password>",
        "2": "<password>",
        "3": "<password>",
        "4": "<password>",
        "5": "<password>",
        "6": "<password>",
        "7": "<password>",
        "8": "<password>",
        "9": "<password>",
    },
    "tunnel": {
        "0": "<password>",
        "1": "<password>",
    },
    "jugsaw": {
        "0": "<password>",
        "1": "<password>",
        "2": "<password>",
        "3": "<password>",
        "4": "<password>",
        "5": "<password>",
        "6": "<password>",
        "7": "<password>",
        "8": "<password>",
        "9": "<password>",
        "10": "<password>",
    }

}

@app.route('/api/start', methods=['POST'])
def start_container():
    data = request.get_json()
    challenge = data.get('challenge')
    level = str(data.get('level'))

    # Validate inputs
    if not challenge or not level:
        return jsonify({"error": "Missing challenge or level"}), 400

    if challenge not in username_map or level not in username_map[challenge]:
        return jsonify({"error": "Unknown challenge or level"}), 400

    username = username_map[challenge][level]
    password = password_map[challenge][level]

    # Run spawn_container.py with args challenge and level
    try:
        result = subprocess.run(
            ["/usr/bin/python3", "<PATH_TO_spawn_container.py>", challenge, level],
            capture_output=True,
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": f"Failed to start container: {e}",
            "stdout": e.stdout,
            "stderr": e.stderr
        }), 500

    # Query latest container port from DB
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT port FROM containers
            WHERE challenge = ? AND level = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (challenge, level))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({"error": "Port not found in DB"}), 500

        port = row[0]

    except Exception as e:
        return jsonify({"error": f"Database error: {e}"}), 500

    return jsonify({
        "host": "<DOMAIN>",
        "port": port,
        "username": username,
        "password": password
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```