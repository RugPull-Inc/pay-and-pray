CREATE TABLE positions (
    user_id        UUID          NOT NULL REFERENCES users(id),
    ticker         VARCHAR(20)   NOT NULL,
    quantity       INT           NOT NULL,
    avg_buy_price  DECIMAL(19,4) NOT NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, ticker)
);
