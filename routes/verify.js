const router = require("express").Router();
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "680587798801-qp0mndlka16fgm91ed97gkoot3ru5145.apps.googleusercontent.com";

module.exports = function verify(db) {
  router.post("/verify", (req, res) => {
    const id_token = req.body.id_token;
    const client = new OAuth2Client(CLIENT_ID);
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID
      });
      const payload = ticket.getPayload();
      const userid = payload["sub"];
      const username = payload["given_name"];
      const useremail = payload["email"];
      db.query(
        `
        INSERT INTO users (id, username, email)
        VALUES ($1, $2, $3) ON CONFLICT (id)
        DO NOTHING
        RETURNING id
        `,
        [userid, username, useremail]
      ).then(data => {
        res.json(data.rows[0]);
      });
    }
    verify().catch(console.error);
  });

  return router;
};
