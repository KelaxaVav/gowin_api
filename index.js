require('dotenv').config();
const express = require("express");
const cronjob = require("./cronjobs");
const router = require("./routes");
const routerV2 = require("./routesV2");
const cors = require("cors");
const crypto = require("node:crypto");
const paginationHandler = require('./utils/paginationHandler');
const successHandler = require('./utils/successHandler');
const errorHandler = require('./utils/errorHandler');
const jwtAuth = require('./utils/jwtAuth');
const authenticate = require('./utils/authenticate');
const dateParser = require('./utils/dateParser');
global.__basedir = __dirname;

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded({ extended: true, }));
app.use(successHandler);
app.use(paginationHandler);
app.use(dateParser);
app.use(jwtAuth);

if (process.env.CRONJOB != "false") {
  cronjob.scheduleJobs();
}

// Routes for the Path
// app.use("/api/v1", authenticate('/auth/login'), router);
app.use("/api/v2", routerV2);
app.use("/", express.static("public"));

// Error Handle for unknown requests
app.all("*", (req, res, next) => {
  res.status(404).sendFile(`${__dirname}/templates/404.html`);
});

app.use(errorHandler);

module.exports = app;