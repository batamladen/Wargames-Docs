## api.py

```
from flask import Flask
from flask_cors import CORS

from academy import academy_bp    # acad blueprint
from auth import auth_bp    # auth blueprint
from flag import flag_bp    # flag submission blueprint

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(flag_bp)
app.register_blueprint(academy_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
```