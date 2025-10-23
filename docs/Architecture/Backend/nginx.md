## 🧩 Nginx Configuration

The **Nginx** service acts as a **reverse proxy** in front of the Flask backend, handling HTTPS encryption, routing, and basic security headers.  
It ensures that all API traffic is securely forwarded to the correct internal Flask applications running on the VPS.

This configuration file defines how requests are handled and routed inside the server.

<br/>

## Full Nginx Code
```
server {
    listen 443 ssl http2;
    server_name <Domain>;

    # SSL certificates
    ssl_certificate <SSL path>/fullchain.pem;
    ssl_certificate_key <SSL path>/privkey.pem;

    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;

    # Authentication routes
    location /api/auth/ {
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Flag-related routes
    location /api/flags/ {
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Academy (learning) routes
    location /api/academy {
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Main API (container management and game logic)
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;        
    }

    # Password and flag verification service
    location /check-password {
        proxy_pass http://127.0.0.1:8080/check-password;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

```

## ⚙️ Main Responsibilities

### 1. SSL Termination
Nginx manages HTTPS traffic using certificates issued by **Let’s Encrypt**:



### 2. Security Headers
Basic protection headers are applied globally:


```
add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;
These help prevent clickjacking and MIME-type sniffing attacks.
```

### 3. Reverse Proxy Routing
Each backend service runs on a specific port.
Nginx forwards incoming API requests to the appropriate Flask process:


| Path              | Internal Port | Description                                                                 |
|-------------------|---------------|------------------------------------------------------------------------------|
| `/api/auth/`      | `5050`        | Handles login, registration, and authentication routes.                      |
| `/api/flags/`     | `5050`        | Manages flag submission and validation endpoints.                            |
| `/api/academy`    | `5050`        | Reserved for learning-related routes and user stats.                         |
| `/api`            | `5000`        | Main game backend (`server.py`) for container spawning and challenge control. |
| `/check-password` | `8080`        | Dedicated Flask app for isolated password/flag verification (`check-password.py`). |



### 4. Proxy Headers
Nginx passes important client information to Flask:

```
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

This ensures proper IP logging, HTTPS awareness, and consistent request handling.


### 5. HTTPS Support
Enabled for improved performance:

```
listen 443 ssl http2;
```

## Summary

The Nginx layer is the entry point of the WGM backend.
It:

- Handles all HTTPS requests
- Routes them to the correct Flask app
- Applies basic security headers
- Logs real client IPs
- Enables modular scaling between multiple Flask processes