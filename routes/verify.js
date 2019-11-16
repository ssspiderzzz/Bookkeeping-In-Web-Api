const router = require("express").Router();
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "680587798801-qp0mndlka16fgm91ed97gkoot3ru5145.apps.googleusercontent.com";

module.exports = function verify(db) {
  router.post("/verify", (req, res) => {
    console.log(req.headers);
    const id_token = req.body.id_token;
    const client = new OAuth2Client(CLIENT_ID);
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID
      });
      const payload = ticket.getPayload();
      const userid = payload["sub"];
      console.log(payload);
      console.log(userid);
    }
    verify()
      .then(res.json({}))
      .catch(console.error);
  });

  return router;
};
