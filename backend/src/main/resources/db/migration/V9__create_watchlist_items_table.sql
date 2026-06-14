DROP TABLE watchlist_items;

CREATE TABLE watchlist_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    ticker     VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_watchlist_user_ticker UNIQUE (user_id, ticker)
);
