CREATE TABLE batch_runs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at  TIMESTAMP WITH TIME ZONE,
    status        VARCHAR(10)  NOT NULL,
    error_summary TEXT
);
