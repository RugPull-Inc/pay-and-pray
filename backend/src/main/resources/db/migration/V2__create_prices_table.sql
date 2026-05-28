CREATE TABLE prices (
    ticker     VARCHAR(20) PRIMARY KEY,
    price      DECIMAL(12, 4) NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL
);
