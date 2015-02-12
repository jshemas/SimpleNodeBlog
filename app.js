var express = require('express'),
	app = express(),
	expressLayouts = require('express-ejs-layouts'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	MongoStore = require('connect-mongo')(session),
	methodOverride = require('method-override'),
	bodyParser = require('body-parser'),
	dbPath = 'mongodb://localhost/something',
	mongoose = require('mongoose'),
	email = require("emailjs/email"),
	winston = require('winston'),
	argv = require('optimist').argv;

// set up the logger
winston.add(winston.transports.File, { filename: 'infoLog.log' });
winston.remove(winston.transports.Console);

// load config (be sure to update this with your settings)
var config = require('./config')(email);

// import models
var Blog = require('./models/Blog')(mongoose, winston);
var User = require('./models/User')(mongoose, winston, config);

// mongodb connect
mongoose.connect(dbPath, function onMongooseError(err) {
	if (err) throw err;
});

// configure Express
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('layout', 'layout');
app.set('port', process.env.PORT || 8080);
app.use(expressLayouts);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(session({
    secret: 'choo choo',
    name: 'simpleblogcookie',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

// set routes
require('./routes/main.js')(app, Blog, User, mongoose, config, winston);

// if this is first time running this app
// add some blog post and comments
if (argv.s) {
	console.log("Running Blog for the first time!");
	Blog.firstRunBlogPost();
	User.firstRunBlogUser();
};

// run on port 8080
app.listen(app.get('port'), function() {
	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});