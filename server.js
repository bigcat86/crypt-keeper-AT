// Import necessary packages
const express = require('express');
// const axios = require('axios');
const session = require('express-session');
const sequelize = require('./config/connection'); // Sequelize database connection
const routes = require('./controllers'); // Import API routes
const exphbs = require('express-handlebars'); // Import Handlebars
const helpers = require('./utils/helpers'); //import utils/helpers functions
const path = require('path');
const auth = require('./utils/auth');


const app = express();
const PORT = process.env.PORT || 3001;

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Set up sessions with Sequelize
const sess = {
    secret: process.env.SESS_SECRET,
    cookie: {
      path: '/',
      maxAge: 3600000,
      httpOnly: false,
      secure: false,
      sameSite: true
    },
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
      db: sequelize
    })
  };

app.use(session(sess));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '/public')));

// Set up Handlebars.js engine
const hbs = exphbs.create({ helpers });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

 // Set up authentication middleware
// app.use(auth);

// Add routes, both API and home
app.use(routes);

// Start server after DB connection
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
  });