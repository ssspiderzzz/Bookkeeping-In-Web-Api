const router = require("express").Router();

module.exports = function remove(db) {
  router.post("/delete/:id", (req, res) => {
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

  return router;
};
