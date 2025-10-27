---
sidebar_position: 1
title: Hosting
---

## Frontend Hosting

The frontend of the Wargames Platform is a web application hosted on GitHub Pages.

Since GitHub is the place we host all our frontend files, it was a perfect fit to deploy the  repo on the GitHub Pages.

<br/>

## Backend Hosting

The backend is deployed on a private VPS server.
It runs multiple Flask-based API services including:

- Auth API → handles registration, login, and JWT authentication
- Server API → manages container spawning and challenge environments
- Academy API → tracks learning progress and aura points

Nginx acts as a reverse proxy and SSL terminator, routing requests to the appropriate Flask services.
Each service is isolated as a systemd service, ensuring reliability and easy restarts.

<br/>

## Communication

All frontend–backend communication happens via HTTPS REST API endpoints:

```
https://api.wargames.batamladen.com/api/<service>/<endpoint>
```

CORS is configured to only allow requests from:
https://wargames.batamladen.com

<br/>

### Simple Communication Scheme

:::note[Schema]

```text
                   ┌──────────────────────────────────┐
                   │  🌐 User Browser                 │
                   │  (Front-end)                     │
                   │  https://wargames.batamladen.com │
                   └──────────────┬───────────────────┘
                                  │
                                  │  HTTPS Requests (CORS allowed)
                                  ▼
                   ┌─────────────────────────────────┐
                   │  NGINX Reverse Proxy            │
                   │  (api.wargames.batamladen.com)  │
                   │─────────────────────────────────│
                   │  SSL Termination                │
                   │  Request Routing                │
                   │  /api/auth/ → Flask Auth        │
                   │  /api/start/ → Flask Spawn      │
                   │  /api/academy/ → Flask Academy  │
                   └──────────────┬──────────────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
 ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
 │ Flask Auth Service│  │ Flask Server API  │  │ Flask Academy API │
 │ Handles JWT auth  │  │ Spawns Docker     │  │ Tracks lessons,   │
 │ & user management │  │ containers per    │  │ tasks & aura pts. │
 │                   │  │ challenge level.  │  │                   │
 └────────┬──────────┘  └────────┬──────────┘  └────────┬──────────┘
          │                      │                      │
          │  DB (shared)         │                      │
          │──────────────────────┘                      │
          ▼                                             ▼
 ┌──────────────────────────────┐          ┌──────────────────────────┐
 │  /'database path'            │          │ Docker Engine            │
 │  Stores users, progress,     │          │ Spawns isolated CTF envs │
 │  tokens & aura points.       │          │ via spawn_container.py   │
 └──────────────────────────────┘          └──────────────────────────┘
:::