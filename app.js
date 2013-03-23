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

// when a comment post is made
app.post('/blog/postCommentNow', function(req, res){ 
	console.log("User trys to posts comment");
	console.log("comment,",req.param('comment', ''));
	console.log("gender,",req.param('gender', ''));
	var comment = req.param('comment', '');
	var blogPostID = req.param('blogPostID', '');
	//must have comment and blogID
	if ( comment == null || comment.length < 1 || blogPostID == null || blogPostID.length < 1 ) {
		console.log("User had bad comment or blogPostID");
		console.log("comment:",comment);
		console.log("blogPostID:",blogPostID);
		res.send(400);
		return;
	}
	//must be logged in
	if ( req.user == null ) {
		console.log("User was not logged in");
		res.send(400);
		return;
	}
	//find blog
	Blog.getSingleBlogPost(blogPostID, function(blog) {
		comment = {
			author: req.user.displayName,
			body: comment
		};
		//add comment
		blog.comment.push(comment);
		blog.save(function (err) {
			if (err) {
				console.log('error saving comment: ' + err);
			}
		});
	});
	res.send(200); 
});

// homepage
app.get('/', function(req, res){
	Blog.getBlogPost( function(blog) {
		res.render('index', { user: req.user, blog: blog });
	});
});

// login test for commenting
app.get('/blog/amilogin', function(req, res, next){
	if ( req.user != null ) {
		res.send(200);
	} else {
		res.send(203);
	}
	return;
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

// facebook channel
app.get('/channel', function(req, res){
	res.render('channel', { user: req.user });
});

// facebook reg
app.post('/fbreg', function(req, res){
	var provider_id = req.param('id', '');
	var displayName = req.param('name', '');
	var first = req.param('first_name', '');
	var last = req.param('last_name', '');
	var profileUrl = req.param('link', '');
	var gender = req.param('gender', '');
	var blogEvent = req.param('blogEvent', '');
	console.log("blogEvent:",blogEvent);
	var provider = 'facebook';
	User.register(first,last,provider,provider_id,gender,profileUrl,displayName, function(account) {
		if(account){
			//there is an event
			if(blogEvent) {
				if(blogEvent.eventType == 'comment'){
					var comment = blogEvent.comment
					var blogPostID = blogEvent.blogPostID
					//must have comment and blogID
					if ( comment == null || comment.length < 1 || blogPostID == null || blogPostID.length < 1 ) {
						console.log("User had bad comment or blogPostID");
						console.log("comment:",comment);
						console.log("blogPostID:",blogPostID);
						res.send(400);
						return;
					}
					//find blog
					Blog.getSingleBlogPost(blogPostID, function(blog) {
						comment = {
							author: account.displayName,
							body: comment
						};
						//add comment
						blog.comment.push(comment);
						blog.save(function (err) {
							if (err) {
								console.log('error saving comment: ' + err);
							}
						});
					});
				}
			}
			res.send(200);
		} else {
			res.send(400);
		}
	});
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