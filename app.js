/*********************
 * Module dependencies
 *********************/

var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var log = require('./libs/log')(module);
var mongoose = require('./libs/mongoose');
var HttpError = require('./error').HttpError;


// for middleware
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var errorhandler = require('errorhandler');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.engine('ejs', require('ejs-locals')); // ejs render
app.engine('html', require('ejs').renderFile); // html render


/***************
 * Configuration
 ***************/

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // ejs render
// app.set('view engine', 'html'); // html render



// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Logger
if (app.get('env') === 'development') {
  app.use(logger('dev'));
} else {
  app.use(logger('default'));
  }


app.use(bodyParser.json()); // read data from POST,json... => and data it becomes available in req.body..
app.use(cookieParser()); // req.headers => req.cookies
app.use(require('./middleware/sendHttpError'));


var MongoStore = require('connect-mongo')(session);
app.use(session({
  secret: config.get("session:secret"),
  key: config.get("session:key"),
  cookie: config.get("session:cookie"),
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(require("./middleware/loadUser"));

app.use(function(req, res, next) {
  req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
  // res.send("Visits: " + req.session.numberOfVisits);
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



/********
 * Routes
 ********/
app.use('/', routes);



app.get('/test', function(req, res, next) {
  res.send(500,'Test');
});
app.use('/users', users);




//  catch 404 and forward to error handler
if (app.get('env') === 'development') {

} else {
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
}
// errorhandler
app.use(function(err, req, res, next) {
  // NODE_ENV = 'development' || 'production'
  if (typeof err == 'number') { // next(404);
    err = new HttpError(err);
  }
  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') === 'development') {
      var errorHandler = errorhandler();
      errorHandler(err, req, res, next);
    } else {
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
      // res.send(500);
    }
  }
});





/**************
 * Start Server
 **************/

http.createServer(app).listen(config.get('port'), function() {
  log.info('Express server litening on port:' + config.get('port'));
});

// module.exports = app;
