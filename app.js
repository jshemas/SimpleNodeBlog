var express = require('express'),
	app = express(),
	expressLayouts = require('express-ejs-layouts'),
	MemoryStore = require('connect').session.MemoryStore,
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

// configure Express
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('layout', 'layout')
	app.use(expressLayouts);
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({
		secret: 'choo choo',
		store: new MemoryStore()
	}));
	mongoose.connect(dbPath, function onMongooseError(err) {
		if (err) throw err;
	});
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

// set routes
var routes = require(__dirname + '/routes/main.js')(app, Blog, User, mongoose, config, winston);

// if this is first time running this app
// add some blog post and comments
if (argv.s) {
	console.log("Running Blog for the first time!");
	Blog.firstRunBlogPost();
	User.firstRunBlogUser();
};

// run on port 8080
app.listen(8080);
console.log("Server Running!");