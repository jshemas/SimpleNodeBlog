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

// about me page
app.get('/about', function(req, res){
	Blog.getBlogPost( function(blog) {
		res.render('about', { blog: blog });
	});
});

// contact me page
app.get('/contact', function(req, res){
	Blog.getBlogPost( function(blog) {
		res.render('contact', { blog: blog });
	});
});

// single blog post page
app.get('/blog/:blodID?', function(req, res){
	var blodID = req.params.blodID;
	Blog.getSingleBlogPost(blodID, function(blog) {
		res.render('viewBlogPost', { blog: blog });
	});
});

// admin page
app.get('/admin', function(req, res){
	if ( req.session.loggedIn == true || req.session.accountId == '5154ede66f71b40939e32982' ) {
		res.render('admin');
	} else {
		res.redirect('/'); //not a admin
	}
});

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
	if ( req.session.loggedIn != true || req.session.accountId != '5154ede66f71b40939e32982' ) {
		res.send(400);
		return;
	}
	Blog.blogPost(title, subTitle, tags, body, req.session.displayName); //go to blogPost in models
	res.send(200);
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
		req.session.displayName = account.displayName;
		res.send(200);
	});
});

// post comment
app.post('/postCommentNow', function(req, res){
	var email = req.param('email', ''),
		comment = req.param('comment', ''),
		name = req.param('name', ''),
		blogPostID = req.param('blogPostID', '');
	User.register(email,name, function(account) {
		//found the account
		if(account){
			//must have comment and blogID
			if ( comment == null || comment.length < 1 || blogPostID == null || blogPostID.length < 1 ) {
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
			res.send(200);
		} else {
			res.send(400);
		}
	});
});

// run on port 8080
app.listen(8080);
console.log("Server Running!");