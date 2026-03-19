require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// cookie
app.use(cookieParser());

// static file
app.use(express.static(path.join(__dirname, 'public')));

// view engine (PUG)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// routes
const route = require('./routes');
route(app);

// start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});