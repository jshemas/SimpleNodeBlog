module.exports = function(app, Blog, User, mongoose, emailServer) {
	/*
	 * GET Home Page
	 */
	app.get('/', function(req, res){
		Blog.getBlogPost( function(blog) {
			res.render('index', { blog: blog });
		});
	});

	/*
	 * GET About Me Page
	 */
	app.get('/about', function(req, res){
		Blog.getBlogPost( function(blog) {
			res.render('about', { blog: blog });
		});
	});

	/*
	 * GET Contact Me Page
	 */
	app.get('/contact', function(req, res){
		Blog.getBlogPost( function(blog) {
			res.render('contact', { blog: blog });
		});
	});

	/*
	 * GET Admin Page
	 */
	app.get('/admin', function(req, res){
		if ( req.session.loggedIn == true ) {
			res.render('admin');
		} else {
			res.redirect('/'); //not a admin
		}
	});

	/*
	 * GET Login Page
	 */
	app.get('/login', function(req, res){
		res.render('login');
	});

	/*
	 * POST Login Page
	 */
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
			res.send(200);
		});
	});

	/*
	 * GET Logout Page
	 */
	app.get('/logout', function(req, res){
		req.session.destroy(function(err){ });
		res.redirect('/'); //go back to index
	});

	/*
	 * GET Single Blog Page
	 */
	app.get('/blog/:blodID?', function(req, res){
		var blodID = req.params.blodID;
		Blog.getSingleBlogPost(blodID, function(blog) {
			res.render('viewBlogPost', { blog: blog });
		});
	});

	/*
	 * POST A Blog - From Admin Page
	 */
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
		if ( req.session.loggedIn != true ) {
			res.send(400);
			return;
		}
		Blog.blogPost(title, subTitle, tags, body, req.session.displayName); //go to blogPost in models
		res.send(200);
	});

	/*
	 * POST A Comment - From Single Blog Page
	 */
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

	/*
	 * POST A Email - From Contact Me Page
	 */
	app.post('/emailme', function(req, res){
		//set vars
		var email = req.param('email', ''),
			emailmessage = req.param('message', ''),
			name = req.param('name', '');
		//build email message
		emailmessage = emailmessage + " - " + name + " @ " + email;
		// send it!
		emailServer.send({
			text: emailmessage, 
			from: email, 
			to: "something@gmail.com", //your email
			subject: "Simple Node Blog"
		}, function(err, message) { 
			//console.log(err || message); 
			res.send(200);
		});
	});
};