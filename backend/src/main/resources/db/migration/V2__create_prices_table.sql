CREATE TABLE prices (
    ticker      VARCHAR(20)   PRIMARY KEY,
    price       DECIMAL(19,4) NOT NULL,
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
