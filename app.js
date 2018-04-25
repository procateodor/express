var express = require('express');
var loginController = require('./controllers/loginController');

var cookieParser = require('cookie-parser');

var app = express();

// Cookie
app.use(cookieParser());

// Set up template engine
app.set('view engine', 'ejs');

// Static files
app.use(express.static('./public'));

// Fire controllers
loginController(app);

// Listen to port
app.listen(3000);

console.log('Server running at http://localhost:3000');