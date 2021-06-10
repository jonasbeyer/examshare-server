const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const config = require("./config.js");
const middleware = bodyParser.urlencoded({ limit: "100mb", extended: true });
// const multipartUrls = [
//   config.apiUrl("tasks/add"),
//   config.apiUrl("users/profileImage"),
// ];

global.__basePath = path.resolve("./");
global.__config = config;

app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.resolve("./public")));
app.disable("x-powered-by");

app.use("/", require("./home/index.controller"));
app.use("/verify", require("./home/verify.controller"));

// app.use((req, res, next) =>
//   multipartUrls.indexOf(req.path) > -1 ? next() : middleware(req, res, next),
// );
app.use(middleware);
app.use(config.apiUrl("*"), require("./shared/middleware/version.middleware"));

app.use(config.apiUrl("auth"), require("./auth/auth.controller"));
app.use(config.apiUrl("subjects"), require("./subject/subject.controller"));
app.use(config.apiUrl("tasks"), require("./task/task.controller"));
app.use(config.apiUrl("reports"), require("./report/report.controller"));
app.use(config.apiUrl("comments"), require("./comment/comment.controller"));
app.use(config.apiUrl("users"), require("./user/user.controller"));
app.use(
  config.apiUrl("moderation"),
  require("./internal/moderation/moderation.router"),
);
app.use(
  config.apiUrl("administration"),
  require("./internal/admin/admin.router"),
);

connectToDatabase()
  .then(() =>
    app.listen(config.port, config.host, () => {
      require("./shared/utils/userValidator");
      console.info("Waiting for requests...");
    }),
  )
  .catch((err) => console.error(err));

function connectToDatabase() {
  const databaseUrl = config.databaseUrl;
  return mongoose
    .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.info(`Connected to database on ${databaseUrl}`));
}
