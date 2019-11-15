const router = require("express").Router();

module.exports = function userData(db) {
  router.post("/data", (req, res) => {
    console.log("Login user id: " + req.body.id);
    if (req.body.id) {
      const login_user_id = req.body.id;
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
  });

  return router;
};
