const router = require("express").Router();

module.exports = function verify(db) {
  router.post("/verify", (req, res) => {
    console.log(req.headers);
    console.log(req.body);
    res.json({});
  });

  return router;
};
