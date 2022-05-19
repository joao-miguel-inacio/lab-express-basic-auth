// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config');

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

// default value for title local
const projectName = 'lab-express-basic-auth';
const capitalized = string => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with Ironlauncher`;

// 👇 Start handling routes here
const index = require('./routes/index');
app.use('/', index);

app.use("/", require("./routes/auth.routes"));

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

// ℹ️ global package used to `normalize` paths amongst different operating systems
// https://www.npmjs.com/package/path
const path = require("path");

// require express-session and connect-mongo
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      cookie: {
        maxAge: 60 * 60 * 24 * 7,
      },
      store: MongoStore.create({
        mongoUrl:
          process.env.MONGODB_URI,
        ttl: 60 * 60 * 24 * 7,
      }),
    })
  );

module.exports = app;