CREATE TABLE tracked_tickers (
    ticker     VARCHAR(20) PRIMARY KEY,
    source     VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
