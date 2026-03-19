const express = require('express');
const app = express();

const bodyParser = require('body-parser');
require('dotenv').config();

// set pug
app.set("view engine", "pug");
app.set("views", "./views");

// set routes
app.get("/", (req, res) => {
    res.render("index");
});


app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});