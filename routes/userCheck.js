const router = require("express").Router();

module.exports = function userCheck(db) {
  router.post("/userCheck", (req, res) => {
    console.log(`email sent form post: ${req.body.email}`);
    console.log(`email form cookie: ${req.cookies.email}`);
    const user_email = req.cookies.email || req.body.email;
    if (user_email) {
      db.query(
        `SELECT id
        FROM users WHERE email = $1
        `,
        [user_email]
      ).then(id => {
        console.log(`check id.rows[0]:`);
        console.log(id.rows[0]);
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
            [user_email, ""]
          ).then(data => {
            console.log("create user id:" + data.rows[0]);
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
