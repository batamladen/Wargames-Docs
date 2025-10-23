

This script is used for the index page to check if the password for anonymous entery is correct.

## Chack-password.py

```
#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)

# More permissive CORS for debugging (tighten this later)
CORS(app, resources={
    r"/check-password": {
        "origins": ["*"],  # Temporary wildcard for debugging
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

CORRECT_PASSWORD = "ScruMbLed_E99s"

@app.route('/check-password', methods=['POST', 'OPTIONS'])
def check_password():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug print
        
        if not data:
            return jsonify({"error": "No data"}), 400
            
        password = data.get("password", "").strip()
        print(f"Password attempt: '{password}'")  # Debug print
        
        if password == CORRECT_PASSWORD:
            print("Password correct!")  # Debug print
            return jsonify({
                "success": True,
                "redirect": "https://wargames.batamladen.com/home.html"
            })
        else:
            print(f"Wrong password. Expected: {CORRECT_PASSWORD}, Got: {password}")  # Debug
            return jsonify({"success": False}), 403
            
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)

```