var express = require('express');
var engine = require('ejs-locals');
var app = express();
var MemoryStore = require('connect').session.MemoryStore;
var dbPath = 'mongodb://localhost/something';
var mongoose = require('mongoose');
var email   = require("emailjs/email");

// import models
var Blog = require('./models/Blog')(mongoose);
var User = require('./models/User')(mongoose);

// config for emailjs for the contact page
var emailServer  = email.server.connect({
	user: "something@gmail.com", 
	password: "password", 
	host: "smtp.gmail.com", 
	ssl: true
});

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

// routes
var routes = require(__dirname + '/routes/main.js')(app, Blog, User, mongoose, emailServer);

// run on port 8080
app.listen(8080);
console.log("Server Running!");