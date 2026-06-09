# StatusPulse

A real-time API health monitoring dashboard. Add any public URL and 
StatusPulse will ping it every minute, track uptime and latency, 
and alert you with email using SendGrid when it goes down.

## Tech stack

- **Backend** — Node.js, Express, PostgreSQL
- **Worker** — node-cron, axios
- **Frontend** — React (Vite)
- **Testing** — Jest (unit + integration), Selenium WebDriver (E2E)
- **DevOps** — Docker Compose, GitHub Actions CI

## Running locally

\`\`\`bash
git clone https://github.com/Badr029/statuspulse.git
cd statuspulse
cp .env.example .env        # fill in your values
docker-compose up --build
\`\`\`

App runs at http://localhost:5173  
API runs at http://localhost:3000

## Architecture



## Project structure

\`\`\`
api/        Express REST API + PostgreSQL
worker/     Background ping scheduler
frontend/   React dashboard
tests/      Jest unit tests + Selenium E2E
\`\`\`
