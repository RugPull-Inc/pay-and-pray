CREATE TABLE watchlist_items (
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker VARCHAR(20) NOT NULL
);
