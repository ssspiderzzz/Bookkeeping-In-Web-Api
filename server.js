const Express = require("express");
const App = Express();
const BodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const PORT = process.env.PORT || 8080;
const { Pool } = require("pg");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const dbParams = require("./db_config");

// routers
const userCheck = require("./routes/userCheck");
const userData = require("./routes/userData");
const create = require("./routes/create");
const remove = require("./routes/remove");
const edit = require("./routes/edit");
const verify = require("./routes/verify");

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
var corsOptions = {
  origin: true,
  credentials: true,
  allowedHeaders: [
    "X-PINGOTHER",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "cookie",
    "Set-Cookie"
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
App.use(helmet());
App.use(morgan("dev"));
App.use(BodyParser.urlencoded({ extended: false }));
App.use(BodyParser.json());
App.use(cookieParser());
App.use(cors(corsOptions));
App.use(Express.static("public"));

App.use("/api", userCheck(db));
App.use("/api", userData(db));
App.use("/api", create(db));
App.use("/api", remove(db));
App.use("/api", edit(db));

App.use("/api", verify(db));

App.listen(PORT, () => {
  console.log(
    `Express seems to be listening on port ${PORT} so that's pretty good 👍`
  );
});
