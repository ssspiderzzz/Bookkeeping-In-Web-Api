const Express = require("express");
const App = Express();
const bcrypt = require("bcrypt");
const BodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const PORT = 8080;
const { Pool } = require("pg");
require("dotenv").config();
const dbParams = require("./db_config");

const db = new Pool(dbParams);

db.connect((error, client) => {
  console.log(process.env.DB_HOST);
  if (error) {
    console.log(error);
  } else {
    console.log("connected");
  }
});

// Express Configuration
App.use(morgan("dev"));
App.use(BodyParser.urlencoded({ extended: false }));
App.use(BodyParser.json());
App.use(cookieParser());
App.use(Express.static("public"));

App.get("/api/userCheck", (req, res) => {
  if (req.cookies.email) {
    db.query(
      `SELECT id
    FROM users WHERE email = $1
    `,
      [req.cookies.email]
    ).then(id => {
      if (id.rows) {
        console.log("login user id:" + JSON.stringify(id.rows));
        res.json(id.rows[0]);
      } else {
        db.query(
          `
        INSERT INTO 
        users (email, settings)
        VALUES ($1, $2)
        RETURNING id;
        `,
          [req.cookies.email, ""]
        ).then(data => {
          console.log("create user id:" + JSON.stringify(data.rows));
          res.json(data.rows[0]);
        });
      }
    });
  }
});

App.get("/api/data", (req, res) => {
  console.log(req.cookies);

  db.query(
    `
    SELECT * 
    FROM orders WHERE user_id = $1
    `,
    [1]
  )
    .then(data1 => {
      db.query(`SELECT * FROM items`).then(data2 => {
        res.json({ orders: data1, items: data2 });
      });
    })
    .catch(err => console.log(err));
});

App.post("/api/new", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  db.query(
    `
    INSERT INTO 
    orders (customer_name, phone_number, address, order_status, note, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `,
    [
      req.body.newOrder.customer_name,
      0,
      req.body.newOrder.address,
      req.body.newOrder.order_status,
      req.body.newOrder.note,
      1
    ]
  )
    .then(data => {
      for (let item of Object.keys(req.body.newOrder.items)) {
        if (req.body.newOrder.items[item].description) {
          console.log(req.body.newOrder.items[item]);
          db.query(
            `
            INSERT INTO items (description, price, quantity, sub_total, order_id)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
              req.body.newOrder.items[item].description,
              Number(req.body.newOrder.items[item].price),
              Number(req.body.newOrder.items[item].quantity),
              Number(req.body.newOrder.items[item].price) *
                Number(req.body.newOrder.items[item].quantity),
              data.rows[0].id
            ]
          );
        }
      }
      res.redirect("/");
    })

    .catch(err => console.log(err));
});

App.post("/api/delete/:id", (req, res) => {
  db.query(
    `
  DELETE FROM items WHERE order_id = $1;
  `,
    [req.params.id]
  )
    .then(() => {
      db.query(
        `
    DELETE FROM orders WHERE orders.id = $1;
    `,
        [req.params.id]
      ).then(res.json(`Order ${req.params.id} has been deleted!`));
    })
    .catch(err => console.log(err));
});

App.post("/api/edit", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  db.query(
    `
    UPDATE orders
    SET customer_name = $1, phone_number = $2, address = $3,
    order_status = $4, note = $5
    WHERE id = $6;
    `,
    [
      req.body.editOrder.customer_name,
      req.body.editOrder.phone_number,
      req.body.editOrder.address,
      req.body.editOrder.order_status,
      req.body.editOrder.note,
      req.body.editOrder.order_id
    ]
  )
    .then(data1 => {
      for (let item of Object.keys(req.body.editOrder.items)) {
        if (req.body.editOrder.items[item].id) {
          db.query(
            `
                  UPDATE items 
                  SET description = $1, price = $2, quantity = $3, sub_total = $4
                  WHERE id = $5;
                  `,
            [
              req.body.editOrder.items[item].description,
              Number(req.body.editOrder.items[item].price),
              Number(req.body.editOrder.items[item].quantity),
              Number(req.body.editOrder.items[item].price) *
                Number(req.body.editOrder.items[item].quantity),
              req.body.editOrder.items[item].id
            ]
          );
        } else if (req.body.editOrder.items[item].description) {
          db.query(
            `
                  INSERT INTO items (description, price, quantity, sub_total, order_id)
                  VALUES ($1, $2, $3, $4, $5)
                  `,
            [
              req.body.editOrder.items[item].description,
              Number(req.body.editOrder.items[item].price),
              Number(req.body.editOrder.items[item].quantity),
              Number(req.body.editOrder.items[item].price) *
                Number(req.body.editOrder.items[item].quantity),
              req.body.editOrder.order_id
            ]
          );
        }
      }
      res.json("Edit succeed!");
    })
    .catch(err => console.log(err));
});

App.listen(PORT, () => {
  console.log(
    `Express seems to be listening on port ${PORT} so that's pretty good 👍`
  );
});
