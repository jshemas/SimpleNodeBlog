var express = require('express'),
	engine = require('ejs-locals'),
	app = express(),
	MemoryStore = require('connect').session.MemoryStore,
	dbPath = 'mongodb://localhost/something',
	mongoose = require('mongoose'),
	email = require("emailjs/email"),
	fs = require('fs');

// import models
var Blog = require('./models/Blog')(mongoose);
var User = require('./models/User')(mongoose);

// load config (if you see an error here, its because you don't have a config file)
var config = require('./config')(email);

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

// configure Express
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.engine('ejs', engine);
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
var routes = require(__dirname + '/routes/main.js')(app, Blog, User, mongoose, config);

// run on port 8080
app.listen(8080);
console.log("Server Running!");