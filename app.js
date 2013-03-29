var express = require('express');
var engine = require('ejs-locals');
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
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

// import models
var Blog = require('./models/Blog')(mongoose);
var User = require('./models/User')(mongoose);

// homepage
app.get('/', function(req, res){
	Blog.getBlogPost( function(blog) {
		res.render('index', { blog: blog });
	});
});

// single blog post page
app.get('/blog/:blodID?', function(req, res){
	var blodID = req.params.blodID;
	Blog.getSingleBlogPost(blodID, function(blog) {
		res.render('viewBlogPost', { blog: blog });
	});
});

// post a blog page
app.get('/postBlog', function(req, res){
	res.render('postBlog');
});

// login page, used by admin
app.get('/login', function(req, res){
	res.render('login');
});

// logout page, used by admin
app.get('/logout', function(req, res){
	req.session.destroy(function(err){ });
	res.redirect('/'); //go back to index
});

// login page, used by admin
app.post('/userlogin', function(req, res){
	var email = req.param('email', ''),
	password = req.param('password', '');
	//vaile email and password
	if ( null == email || email.length < 1 || null == password || password.length < 1 ) {
		res.send(400);
		return;
	};

	User.login(email, password, function(account) {
		if (!account) {
			res.send(401);
			return;
		}
		req.session.loggedIn = true;
		req.session.accountId = account._id;
		res.send(200);
	});
});

// facebook channel
app.get('/channel', function(req, res){
	res.render('channel');
});

// facebook event
app.post('/fbEvent', function(req, res){
	var provider_id = req.param('id', ''),
		displayName = req.param('name', ''),
		first = req.param('first_name', ''),
		last = req.param('last_name', ''),
		profileUrl = req.param('link', ''),
		gender = req.param('gender', ''),
		blogEvent = req.param('blogEvent', ''),
		provider = 'facebook';
	//first reg the accout (or find it)
	User.register(first,last,provider,provider_id,gender,profileUrl,displayName, function(account) {
		//found the account
		if(account){
			//there is an event
			if(blogEvent) {
				//comment event
				if(blogEvent.eventType == 'comment'){
					var comment = blogEvent.comment;
					var blogPostID = blogEvent.blogPostID;
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
				// if blog post
				} else if (blogEvent.eventType == 'blogpost') {
					var title = blogEvent.title;
					var subTitle = blogEvent.subTitle;
					var tags = blogEvent.tags;
					var body = blogEvent.body;
					//must have title and body
					if ( title == null || title.length < 1 || body == null || body.length < 1 ) {
						res.send(400);
						return;
					}
					Blog.blogPost(title, subTitle, tags, body, account.displayName); //go to blogPost in models
				}
			}
			res.send(200);
		} else {
			res.send(400);
		}
	});
});

// run on port 8080
app.listen(8080);
console.log("Server Running!");