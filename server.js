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
      if (id.rows[0]) {
        console.log("login user id:" + JSON.stringify(id.rows[0]));
        res.json(id.rows[0]);
      } else {
        db.query(
          `
        INSERT INTO 
        users (email, setting)
        VALUES ($1, $2)
        RETURNING id;
        `,
          [req.cookies.email, ""]
        ).then(data => {
          console.log("create user id:" + JSON.stringify(data.rows[0]));
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
    SELECT id FROM users WHERE email = $1
    `,
    [req.cookies.email]
  )
    .then(userID => {
      console.log("Login user id:" + userID.rows[0].id);
      if (userID.rows[0]) {
        const login_user_id = userID.rows[0].id;
        db.query(
          `
          SELECT * FROM orders WHERE user_id = $1
          `,
          [login_user_id]
        ).then(data1 => {
          let order_ids = [];
          data1.rows.map(order => {
            order_ids.push(order.id);
          });
          if (order_ids.length > 0) {
            db.query(
              `
              SELECT * FROM items WHERE order_id IN (${order_ids})
              `
            ).then(data2 => {
              res.json({ orders: data1, items: data2 });
            });
          } else {
            // if user has not order history
            res.json({ orders: [], items: [] });
          }
        });
      } else {
        // if user id is not found
        res.json({ orders: [], items: [] });
      }
    })
    .catch(err => console.log(err));
});

App.post("/api/new", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  const newData = req.body.newOrder;
  db.query(
    `
    SELECT id FROM users WHERE email = $1
    `,
    [req.cookies.email]
  )
    .then(userID => {
      const login_user_id = userID.rows[0].id;
      db.query(
        `
    INSERT INTO 
    orders (customer_name, phone_number, address, order_status, note, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `,
        [
          newData.customer_name,
          newData.phone_number,
          newData.address,
          newData.order_status,
          newData.note,
          login_user_id
        ]
      ).then(data => {
        for (let item of Object.keys(newData.items)) {
          if (newData.items[item].description) {
            console.log(newData.items[item]);
            db.query(
              `
            INSERT INTO items (description, price, quantity, sub_total, order_id)
            VALUES ($1, $2, $3, $4, $5)
            `,
              [
                newData.items[item].description,
                Number(newData.items[item].price),
                Number(newData.items[item].quantity),
                Number(newData.items[item].price) *
                  Number(newData.items[item].quantity),
                data.rows[0].id
              ]
            );
          }
        }
        res.redirect("/");
      });
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
  const editData = req.body.editOrder;
  db.query(
    `
    UPDATE orders
    SET customer_name = $1, phone_number = $2, address = $3,
    order_status = $4, note = $5
    WHERE id = $6;
    `,
    [
      editData.customer_name,
      editData.phone_number,
      editData.address,
      editData.order_status,
      editData.note,
      editData.order_id
    ]
  )
    .then(data1 => {
      for (let item of Object.keys(editData.items)) {
        if (editData.items[item].id) {
          db.query(
            `
            UPDATE items 
            SET description = $1, price = $2, quantity = $3, sub_total = $4
            WHERE id = $5;
            `,
            [
              editData.items[item].description,
              Number(editData.items[item].price),
              Number(editData.items[item].quantity),
              Number(editData.items[item].price) *
                Number(editData.items[item].quantity),
              editData.items[item].id
            ]
          );
        } else if (editData.items[item].description) {
          db.query(
            `
            INSERT INTO items (description, price, quantity, sub_total, order_id)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
              editData.items[item].description,
              Number(editData.items[item].price),
              Number(editData.items[item].quantity),
              Number(editData.items[item].price) *
                Number(editData.items[item].quantity),
              editData.order_id
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
