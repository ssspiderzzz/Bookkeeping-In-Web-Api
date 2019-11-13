const router = require("express").Router();

module.exports = function userCheck(db) {
  router.get("/userCheck", (req, res) => {
    console.log(req);
    console.log(req.cookies);
    console.log(`email: ${req.cookies.email}`);
    if (req.cookies.email) {
      db.query(
        `SELECT id
        FROM users WHERE email = $1
        `,
        [req.cookies.email]
      ).then(id => {
        console.log("login user id:" + JSON.stringify(id.rows[0]));
        if (id.rows[0]) {
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
    } else {
      res.json({});
    }
  });

  return router;
};
