CREATE TABLE transactions (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID          NOT NULL REFERENCES users(id),
    ticker             VARCHAR(20)   NOT NULL,
    type               VARCHAR(4)    NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity           INT           NOT NULL,
    price_at_operation DECIMAL(19,4) NOT NULL,
    created_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);
