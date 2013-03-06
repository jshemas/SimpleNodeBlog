var express = require('express'), passport = require('passport'), util = require('util'), FacebookStrategy = require('passport-facebook').Strategy, engine = require('ejs-locals');
var app = express();
var MemoryStore = require('connect').session.MemoryStore;
var dbPath = 'mongodb://localhost/something';
var mongoose = require('mongoose');

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
	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

// import models
var Blog = require('./models/Blog')(mongoose);
var User = require('./models/User')(mongoose);

// import auth
require('./facebookAuth.js')(app, passport, FacebookStrategy, mongoose, User);

// when a blog post is made
app.post('/postBlogNow', function(req, res){ 
	var title = req.param('title', '');
	var subTitle = req.param('subTitle', '');
	var tags = req.param('tags', '');
	var body = req.param('body', '');
	//must have title and body
	if ( title == null || title.length < 1 || body == null || body.length < 1 ) {
		res.send(400);
		return;
	}
	//must be logged in
	if ( req.user == null ) {
		res.send(400);
		return;
	}
	Blog.blogPost(title, subTitle, tags, body, req.user); //go to blogPost in models
	res.send(200);
});

// homepage
app.get('/', function(req, res){
	Blog.getBlogPost( function(blog) {
		res.render('index', { user: req.user, blog: blog });
	});
});

// single blog post page
app.get('/blog/:blodID?', function(req, res){
	var blodID = req.params.blodID;
	Blog.getSingleBlogPost(blodID, function(blog) {
		res.render('viewBlogPost', { user: req.user, blog: blog });
	});
});

// post a blog page
app.get('/postBlog', function(req, res){
	res.render('postBlog', { user: req.user });
});

// login
app.get('/login', function(req, res){
	res.render('login', { user: req.user });
});

// logout
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
};

// run on port 8080
app.listen(8080);
console.log("Server Running!");