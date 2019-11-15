const router = require("express").Router();

module.exports = function create(db) {
  router.post("/create", (req, res) => {
    console.log(JSON.stringify(req.body, null, 2));
    const newData = req.body.newOrder;
    db.query(
      `
      SELECT id FROM users WHERE email = $1
      `,
      [newData.email]
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

  return router;
};
