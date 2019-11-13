const Express = require("express");
const App = Express();
const BodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const PORT = process.env.PORT || 8080;
const { Pool } = require("pg");
require("dotenv").config();
const cors = require("cors");
const dbParams = require("./db_config");

// routers
const userCheck = require("./routes/userCheck");
const userData = require("./routes/userData");
const create = require("./routes/create");
const remove = require("./routes/remove");
const edit = require("./routes/edit");

// connect database
const db = new Pool(dbParams);
db.connect((error, client) => {
  console.log(process.env.DB_HOST);
  if (error) {
    console.log(error);
  } else {
    console.log("connected");
  }
});

// Express Configuration
App.use(morgan("dev"));
App.use(BodyParser.urlencoded({ extended: false }));
App.use(BodyParser.json());
App.use(cookieParser());
App.use(Express.static("public"));
const corsOptions = {
  origin: "https://amazing-dubinsky-a6a649.netlify.com",
  credentials: true
};
App.use(cors(corsOptions));

App.use("/api", userCheck(db));
App.use("/api", userData(db));
App.use("/api", create(db));
App.use("/api", remove(db));
App.use("/api", edit(db));

App.listen(PORT, () => {
  console.log(
    `Express seems to be listening on port ${PORT} so that's pretty good 👍`
  );
});
