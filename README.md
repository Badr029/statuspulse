# StatusPulse 🟢

> A real-time API health monitoring dashboard — built to demonstrate production-grade backend engineering, automated testing, and DevOps practices.

![CI](https://github.com/YOUR_USERNAME/statuspulse/actions/workflows/ci.yml/badge.svg)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)
![Node](https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black)
![Java](https://img.shields.io/badge/java-17-ED8B00?logo=openjdk&logoColor=white)
![Selenium](https://img.shields.io/badge/selenium-4-43B02A?logo=selenium&logoColor=white)

---

## What is StatusPulse?

StatusPulse monitors the uptime and latency of any public API or URL. Every minute, a background worker pings each registered endpoint, logs the result, and triggers an email alert via SendGrid if a service goes down for 3 consecutive checks (and again when it recovers).

The project was built to showcase a complete engineering workflow — from a structured REST API and background processing, to a live React dashboard, automated testing at multiple levels, and a containerised CI/CD pipeline.

**Live demo screenshot:**

> _Add a screenshot of your running dashboard here_
> `![Dashboard screenshot](docs/screenshot.png)`

---

## Features

- **Monitor any URL** — register any public endpoint and track its uptime
- **Real-time dashboard** — live status cards with UP/DOWN badges, auto-refreshes every 30s
- **Latency history charts** — visualise response times over the last 48 pings (Recharts)
- **Pause / resume monitors** — toggle monitoring on or off without losing history
- **Edit monitors** — update name, URL, or check interval via PATCH
- **Clear history** — wipe ping logs for a monitor without deleting it
- **Automatic email alerts** — SendGrid notification after 3 consecutive failures, plus a recovery email when back up
- **Self-healing containers** — all services restart automatically on failure
- **Zero-config seed data** — pre-loaded monitors so the app is alive on first run
- **Centralised validation middleware** — `getMonitorById` handles ID validation and 404s in one place across all routes

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend API | Node.js 20, Express, PostgreSQL (pg) |
| Background worker | node-cron, axios |
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router |
| Database | PostgreSQL 15 |
| Email alerts | SendGrid (`@sendgrid/mail`) |
| Unit & integration tests | Jest, Supertest *(planned)* |
| E2E tests | Java 17, Selenium WebDriver 4, JUnit 5, Maven *(planned)* |
| Containerisation | Docker, Docker Compose (WSL2 on Windows) |
| CI/CD | GitHub Actions *(planned)* |

---

## Architecture

```
┌──────────────────┐        ┌──────────────────┐
│  React Frontend   │◄──────►│   Express API     │
│  (port 5173)      │        │   (port 3000)     │
└──────────────────┘        └────────┬─────────┘
                                      │
                             ┌────────▼─────────┐
                             │   PostgreSQL 15   │
                             │   - monitors      │
                             │   - ping_logs     │
                             └────────▲─────────┘
                                      │
                             ┌────────┴─────────┐
                             │  Background Worker│
                             │  (node-cron)      │
                             │  pings every 60s  │
                             └────────┬─────────┘
                                      │
                             ┌────────▼─────────┐
                             │  SendGrid Email   │
                             │  (alert on down/  │
                             │   recovery)       │
                             └──────────────────┘
```

All services run in Docker containers on a shared network and communicate by service name (`db`, `api`, `worker`, `frontend`).

---

## Project structure

```
statuspulse/
├── api/                         # Express REST API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── monitors.js      # Full CRUD + controls (toggle, history)
│   │   │   └── health.js        # GET /health
│   │   ├── db/
│   │   │   └── conPool.js       # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   └── errorHandler.js  # Global error handler
│   │   ├── services/
│   │   │   └── email.js         # SendGrid alert service
│   │   └── index.js              # App entry point
│   └── Dockerfile
├── worker/                      # Background ping scheduler
│   ├── src/
│   │   ├── db/
│   │   │   └── conPool.js
│   │   ├── services/
│   │   │   └── email.js         # Copied from api
│   │   ├── prober.js            # HTTP probe + latency measurement
│   │   ├── scheduler.js         # node-cron job + alert logic
│   │   └── index.js
│   └── Dockerfile
├── frontend/                    # React dashboard (Vite + Tailwind)
│   └── src/
│       ├── api/
│       │   └── monitors.js      # Axios API client
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── StatusBadge.jsx
│       │   └── MonitorCard.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── AddMonitor.jsx
│       │   └── MonitorDetail.jsx
│       ├── App.jsx
│       └── main.jsx
├── db/
│   └── migrations/
│       └── 001_initial_schema.sql
├── docs/
│   └── postman_collection.json  # Organised Postman collection
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with WSL2 backend on Windows)
- Git

No need to install Node, PostgreSQL, or anything else locally — everything runs in containers.

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/statuspulse.git
cd statuspulse
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Database
POSTGRES_USER=statuspulse
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=statuspulse_db

# API
PORT=3000
DATABASE_URL=postgresql://statuspulse:your_password_here@db:5432/statuspulse_db

# Email alerts (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
ALERT_FROM_EMAIL=you@example.com
ALERT_TO_EMAIL=you@example.com
```

> SendGrid requires a verified sender. Go to **Settings → Sender Authentication** in your SendGrid dashboard and verify the email used in `ALERT_FROM_EMAIL`.

### 3. Start the application

```bash
docker compose up --build
```

The database schema and seed data are applied automatically on first run via `/docker-entrypoint-initdb.d`.

- API: [http://localhost:3000](http://localhost:3000)
- Frontend dashboard: [http://localhost:5173](http://localhost:5173)

The worker starts pinging seed monitors immediately and every 60 seconds afterward.

### 4. Stop the application

```bash
docker compose down

# To also wipe the database and start fresh:
docker compose down -v
```

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API + database health check |
| `GET` | `/monitors` | List all monitors |
| `POST` | `/monitors` | Create a new monitor |
| `GET` | `/monitors/:id` | Get a single monitor |
| `PATCH` | `/monitors/:id` | Update name, url, or interval |
| `PATCH` | `/monitors/:id/toggle` | Pause or resume a monitor |
| `DELETE` | `/monitors/:id` | Delete a monitor and its history |
| `GET` | `/monitors/:id/history` | Get last N ping results + uptime summary |
| `DELETE` | `/monitors/:id/history` | Clear ping history for a monitor |

A full Postman collection with example requests and validation tests is available at `docs/postman_collection.json`, organised into folders: **Core**, **Controls**, **History**, **Health**, **Alerts**, and **Validation Tests**.

---

## How the worker alerting works

```
Every 60 seconds:
  1. Fetch all monitors where is_active = true
  2. Ping each URL (10s timeout, no redirects followed past 5 hops)
  3. Record status, HTTP code, latency, and any error in ping_logs
  4. If status = down:
       - increment a per-monitor failure counter
       - on the 3rd consecutive failure -> send a "DOWN" email
  5. If status = up and the monitor was previously down:
       - send a "RECOVERED" email
       - reset the failure counter
```

Pings run in parallel using `Promise.allSettled` — one slow or failing monitor never blocks the others.

---

## Design decisions

**Why node-cron for the worker instead of a message queue?**
A message queue (e.g. Redis + Bull) would be more scalable but adds operational complexity not justified at this scope. node-cron is simple, visible, and easy to reason about. A queue-based approach would be the natural next step when scaling to thousands of monitors.

**Why 3 consecutive failures before alerting?**
A single failed ping is often a network blip, not a real outage. Waiting for repeated failures significantly reduces false-positive alerts — the same pattern used by tools like PagerDuty and UptimeRobot.

**Why SendGrid over raw SMTP?**
SendGrid's API handles delivery, retries, and bounce tracking automatically, and the free tier (100 emails/day) is more than enough for this project. Email failures are caught and logged without crashing the worker — a monitoring tool must never go down because its alerting system is unavailable.

**Why a centralised `getMonitorById` middleware?**
Every route that operates on a single monitor (`GET /:id`, `PATCH /:id`, `DELETE /:id`, etc.) needs the same ID validation and existence check. Extracting this into middleware removes duplication and guarantees consistent 400/404 responses across the entire API.

**Why parameterised SQL queries everywhere?**
Every query uses `$1, $2, ...` placeholders instead of string interpolation. This is the standard defence against SQL injection — user input is always treated as data, never as executable SQL.

**Why PostgreSQL over SQLite?**
SQLite would work locally but doesn't reflect real-world backend development. PostgreSQL runs in its own container, behaves identically in development and production, and supports proper connection pooling via `pg.Pool`.

**Why Docker volume mounts + nodemon for development?**
The `api`, `worker`, and `frontend` services mount local source code into the container (`./api:/app`) alongside a separate `node_modules` volume. Combined with `nodemon` (and Vite's dev server for the frontend), code changes are reflected instantly without rebuilding images — while `npm install` still runs inside the container, avoiding Windows/Linux native module conflicts.

**Why `is_active` instead of stopping containers to pause monitoring?**
Pausing a noisy or misconfigured monitor via `PATCH /monitors/:id/toggle` is a deliberate, production-style operational decision — the same way you'd silence an alert in a real monitoring tool — rather than stopping the whole worker.


---

## Roadmap

| Sprint | Status | Description |
|---|---|---|
| 1 | Done | Docker foundation, PostgreSQL schema, README |
| 2 | Done | REST API core (CRUD, validation, SendGrid alerts) |
| 3 | Done | Background worker (node-cron, prober, alerting) |
| 4 | Done | React frontend (dashboard, charts, add monitor form) |
| 6 | Done | Testing - Jest (unit/integration) + Java Selenium (E2E, Page Object Model) |
| 5 | In progress | User authentication (JWT, per-user monitors) |
| 7 | Planned | CI/CD - GitHub Actions (lint -> test -> build) |

---

## Author

**Your Name**
[LinkedIn](https://linkedin.com/in/mohamedbadr14) · [GitHub](https://github.com/Badr029)
