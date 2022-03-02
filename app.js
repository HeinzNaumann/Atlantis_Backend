var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require('cors');
const LoginController = require('./controllers/loginController')
const jwtAuth = require('./lib/jwtAuthMiddleware')

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/api/users");

var app = express();
app.use(cors());

//Connection to the data base
require("./lib/connectMongoose");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

const loginController = new LoginController();


//Rutas del API
app.use("/api/ads/",jwtAuth, require("./routes/api/ads"));
app.use("/api/users", require("./routes/api/users") );
app.post('/api/auth', loginController.postJWT);
app.use('/api/logout', loginController.logout);





// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//setup i18n
const i18n = require("./lib/i18n");
const { log } = require("console");
app.use(i18n.init);

console.log(i18n.__("hello world"));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
