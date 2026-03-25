require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { ensureProjectManagerAccount } = require('./services/bootstrap.service');

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

const startServer = async () => {
  try {
    await ensureProjectManagerAccount();

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
