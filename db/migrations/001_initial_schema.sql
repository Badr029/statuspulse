    
-- MONITORS TABLE

CREATE TABLE IF NOT EXISTS monitors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--PING LOGS TABLE

CREATE TABLE IF NOT EXISTS ping_logs (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('up', 'down')),
    status_code INTEGER,
    latency_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


--INDEXES

CREATE INDEX IF NOT EXISTS idx_ping_logs_monitor_id 
ON ping_logs(monitor_id);

CREATE INDEX IF NOT EXISTS idx_ping_logs_checked_at 
ON ping_logs(checked_at);

-- SEED DATA

INSERT INTO monitors (name, url, interval_seconds) VALUES
    ('GitHub API',          'https://api.github.com',                    60),
    ('JSONPlaceholder',     'https://jsonplaceholder.typicode.com/posts', 60),
    ('CoinDesk API',        'https://api.coindesk.com/v1/bpi/currentprice.json', 60)
ON CONFLICT DO NOTHING; -- Prevent duplicate seed data on multiple runs

INSERT INTO ping_logs (monitor_id, status, status_code, latency_ms, checked_at)
VALUES
    (1, 'up',   200, 142, NOW() - INTERVAL '5 minutes'),
    (1, 'up',   200, 138, NOW() - INTERVAL '4 minutes'),
    (1, 'down', NULL, NULL, NOW() - INTERVAL '3 minutes'),
    (1, 'up',   200, 201, NOW() - INTERVAL '2 minutes'),
    (1, 'up',   200, 155, NOW() - INTERVAL '1 minute')
ON CONFLICT DO NOTHING; -- Prevent duplicate seed data on multiple runs
