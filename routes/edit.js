const router = require("express").Router();

module.exports = function edit(db) {
  router.post("/edit", (req, res) => {
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
  return router;
};
