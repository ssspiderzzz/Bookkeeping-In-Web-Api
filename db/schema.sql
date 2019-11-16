DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS items CASCADE;

CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY NOT NULL,
  username VARCHAR(255),
  email VARCHAR(255),
  setting VARCHAR(255) DEFAULT ''
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  customer_name VARCHAR(255) DEFAULT '',
  phone_number VARCHAR(255) DEFAULT '',
  address VARCHAR(255) DEFAULT '',
  order_status VARCHAR(255),
  date_create TIMESTAMP DEFAULT NOW(),
  date_end TIMESTAMP,
  note VARCHAR(255),
  user_id VARCHAR(255) REFERENCES users(id)
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY NOT NULL,
  description VARCHAR(255) DEFAULT '',
  price INT,
  quantity INT,
  sub_total INT,
  order_id INT REFERENCES orders(id)
);
