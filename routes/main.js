module.exports = function(app, Blog, User, mongoose, config, winston) {

	// define utils
	var validateVar = require('./utils.js').validateVar;

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
		if (req.session.loggedIn == true){
			res.render('admin');
		} else {
			res.redirect('/'); //not a admin
		}
	});

	/*
	 * GET JSON Response of Blog Posts
	 */
	 app.get('/blogJSON', function(req, res){
		Blog.getBlogPost( function(blog) {
			res.json(blog);
		});
	});

	/*
	 * GET Admin Page - Get Blog Post
	 */
	app.get('/admin/blog/:blodID?', function(req, res){
		var blodID = req.params.blodID;
		Blog.getSingleBlogPost(blodID, function(blog) {
			var blogResults = blog;
			if(!blog) {
				blogResults = 'not_found';
			};
			//console.log("blogResults",blogResults);
			res.json(blogResults);
		});
	});

	/*
	 * POST Admin Page - Edit Blog Post
	 */
	app.post('/admin/editBlogNow', function(req, res){
		var title = req.query.editTitle,
			subTitle = req.query.editSubTitle,
			tags = req.query.editTags,
			body = req.query.editBody,
			blogID = req.query.theBlogID;
		//must have title and body
		if(validateVar(title)) {res.sendStatus(400); return;};
		if(validateVar(body)) {res.sendStatus(400); return;};
		//must have a ID
		if(validateVar(blogID)) {res.sendStatus(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.sendStatus(400); return;};
		Blog.blogEditPost(title, subTitle, tags, body, req.session.displayName, blogID, function(results) {
			if(results == 1){
				res.sendStatus(200);
			} else {
				res.sendStatus(400);
			};
		});
	});

	/*
	 * POST Admin Page - Delete Blog Post
	 */
	app.post('/admin/deleteBlogNow', function(req, res){
		var blogID = req.query.theBlogID;
		//must have a ID
		if(validateVar(blogID)) {res.sendStatus(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.sendStatus(400); return;};
		Blog.blogDeletePost(blogID, function(results) {
			if(results == 1){
				res.sendStatus(200);
			} else {
				res.sendStatus(400);
			};
		});
	});

	/*
	 * POST Admin Page - Edit Blog Comment
	 */
	app.post('/admin/editBlogCommentNow', function(req, res){
		var author = req.query.editAuthor,
			body = req.query.editBody,
			blogID = req.query.theBlogID,
			commentID = req.query.theCommentID;
		//must have author and body
		if(validateVar(author)) {res.sendStatus(400); return;};
		if(validateVar(body)) {res.sendStatus(400); return;};
		//must have a ID
		if(validateVar(blogID)) {res.sendStatus(400); return;};
		if(validateVar(commentID)) {res.sendStatus(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.sendStatus(400); return;};
		Blog.blogEditComment(author, body, req.session.displayName, commentID, blogID, function(results) {
			if(results == 1){
				res.sendStatus(200);
			} else {
				res.sendStatus(400);
			};
		});
	});

	/*
	 * POST Admin Page - Delete Blog Comment
	 */
	app.post('/admin/deleteCommentNow', function(req, res){
		var blogID = req.query.theBlogID,
			commentID = req.query.theCommentID;
		//must have a ID
		if(validateVar(blogID)) {res.sendStatus(400); return;};
		if(validateVar(commentID)) {res.sendStatus(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.sendStatus(400); return;};
		Blog.blogDeleteComment(commentID, blogID, function(results) {
			if(results == 1){
				res.sendStatus(200);
			} else {
				res.sendStatus(400);
			};
		});
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
		var email = req.query.email,
			password = req.query.password;
		//is email and password set?
		if(validateVar(email)) {res.sendStatus(400); return;};
		if(validateVar(password)) {res.sendStatus(400); return;};
		// try to login
		User.login(email, password, function(account) {
			if (!account) {
				//account not found
				res.sendStatus(401);
				return;
			}
			//set session
			req.session.loggedIn = true;
			req.session.displayName = account.displayName;
			res.sendStatus(200);
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
			var blogResults = blog;
			if(!blog) {
				blogResults = 'not_found';
			};
			res.render('viewBlogPost', {blog: blogResults});
		});
	});

	/*
	 * GET Blog List Page
	 */
	app.get('/bloglist', function(req, res){
		Blog.getBlogPost( function(blog) {
			res.render('bloglist', { blog: blog });
		});
	});

	/*
	 * POST A Blog - From Admin Page
	 */
	app.post('/postBlogNow', function(req, res){
		var title = req.query.title,
			subTitle = req.query.subTitle,
			tags = req.query.tags,
			body = req.query.body;
		//must have title and body

		if(validateVar(title)) {res.sendStatus(400); return;};
		if(validateVar(body)) {res.sendStatus(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.sendStatus(400); return;};
		Blog.blogPost(title, subTitle, tags, body, req.session.displayName, function(blog) {
			//return blogID
			if(blog && blog.id){
				res.json({ 'blogID': blog.id });
			} else {
				res.sendStatus(400);
			};
		});
	});

	/*
	 * POST A Comment - From Single Blog Page
	 */
	app.post('/postCommentNow', function(req, res){
		var email = req.query.email,
			comment = req.query.comment,
			name = req.query.name,
			blogPostID = req.query.blogPostID;
		if(validateVar(email)) {res.sendStatus(400); return;};
		if(validateVar(comment)) {res.sendStatus(400); return;};
		if(validateVar(name)) {res.sendStatus(400); return;};
		if(validateVar(blogPostID)) {res.sendStatus(400); return;};
		User.register(email,name, function(account) {
			//found the account
			if(account){
				//must have comment and blogID
				Blog.commentPost(account.displayName, comment, blogPostID, function(results) {
					//return blogID
					if(results && results.comment){
						//this need reworked, only looks at first comment
						var commentObj = results.comment;
						res.json({ 'commentID': commentObj[0].id });
					} else {
						res.sendStatus(400);
					};
				});
			} else {
				res.sendStatus(400);
			}
		});
	});

	/*
	 * POST A Email - From Contact Me Page
	 */
	app.post('/emailme', function(req, res){
		//set vars
		var email = req.query.email,
			emailmessage = req.query.message,
			name = req.query.name;
		if(validateVar(email)) {res.sendStatus(400); return;};
		if(validateVar(emailmessage)) {res.sendStatus(400); return;};
		if(validateVar(name)) {res.sendStatus(400); return;};
		//build email message
		emailmessage = emailmessage + " - " + name + " @ " + email;
		// send it!
		config.emailServer.send({
			text: emailmessage,
			from: email,
			to: config.emailAccount,
			subject: "Simple Node Blog"
		}, function(err, results) {
			if(err){
				winston.info('Error in emailme:'+err);
				res.sendStatus(400);
			} else {
				res.sendStatus(200);
			};
		});
	});

	/*
	* The 404 Route - Page Not Found
	*/
	app.use(function(req, res, next){
		//Log this?
		res.status(404);
		res.render('404', { status: 404, url: req.url });
	});

	/*
	* The 500 Route - Server Error
	*/
	app.use(function(err, req, res, next){
		//Log this?
		res.status(500);
		winston.info('[500]ERROR:'+err);
		res.render('500', {status: err.status || 500, error: err});
	});
};