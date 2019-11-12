const router = require("express").Router();

module.exports = function userData(db) {
  router.get("/data", (req, res) => {
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

  return router;
};
