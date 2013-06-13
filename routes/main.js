module.exports = function(app, Blog, User, mongoose, config) {

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
		var title = req.param('editTitle', ''),
			subTitle = req.param('editSubTitle', ''),
			tags = req.param('editTags', ''),
			body = req.param('editBody', ''),
			blogID = req.param('theBlogID', '');
		//must have title and body
		if(validateVar(title)) {res.send(400); return;};
		if(validateVar(body)) {res.send(400); return;};
		//must have a ID
		if(validateVar(blogID)) {res.send(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.send(400); return;};
		Blog.blogEditPost(title, subTitle, tags, body, req.session.displayName, blogID); //go to blogEditPost in models
		res.send(200);
	});

	/*
	 * POST Admin Page - Delete Blog Post
	 */
	app.post('/admin/deleteBlogNow', function(req, res){
		var blogID = req.param('theBlogID', '');
		//must have a ID
		if(validateVar(blogID)) {res.send(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.send(400); return;};
		Blog.blogDeletePost(blogID); //go to blogDeletePost in models
		res.send(200);
	});

	/*
	 * POST Admin Page - Edit Blog Comment
	 */
	app.post('/admin/editBlogCommentNow', function(req, res){
		var author = req.param('editAuthor', ''),
			body = req.param('editBody', ''),
			blogID = req.param('theBlogID', '');
			commentID = req.param('theCommentID', '');
		//must have author and body
		if(validateVar(author)) {res.send(400); return;};
		if(validateVar(body)) {res.send(400); return;};
		//must have a ID
		if(validateVar(blogID)) {res.send(400); return;};
		if(validateVar(commentID)) {res.send(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.send(400); return;};
		Blog.blogEditComment(author, body, req.session.displayName, commentID, blogID); //go to blogEditComment in models
		res.send(200);
	});
	
	/*
	 * POST Admin Page - Delete Blog Comment
	 */
	app.post('/admin/deleteCommentNow', function(req, res){
		var blogID = req.param('theBlogID', '');
			commentID = req.param('theCommentID', '');
		//must have a ID
		if(validateVar(blogID)) {res.send(400); return;};
		if(validateVar(commentID)) {res.send(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.send(400); return;};
		Blog.blogDeleteComment(commentID, blogID); //go to blogDeleteComment in models
		res.send(200);
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
		//is email and password set?
		if(validateVar(email)) {res.send(400); return;};
		if(validateVar(password)) {res.send(400); return;};
		// try to login
		User.login(email, password, function(account) {
			if (!account) {
				//account not found
				res.send(401);
				return;
			}
			//set session
			req.session.loggedIn = true;
			req.session.displayName = account.displayName;
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
		var title = req.param('title', ''),
			subTitle = req.param('subTitle', ''),
			tags = req.param('tags', ''),
			body = req.param('body', '');
		//must have title and body

		if(validateVar(title)) {res.send(400); return;};
		if(validateVar(body)) {res.send(400); return;};
		//must be logged in
		if (req.session.loggedIn != true) {res.send(400); return;};
		Blog.blogPost(title, subTitle, tags, body, req.session.displayName, function(blog) {
			//return blogID
			if(blog && blog.id){
				res.json({ 'blogID': blog.id });
			} else {
				res.json({ 'blogID': '000000' });
			};
		});
	});

	/*
	 * POST A Comment - From Single Blog Page
	 */
	app.post('/postCommentNow', function(req, res){
		var email = req.param('email', ''),
			comment = req.param('comment', ''),
			name = req.param('name', ''),
			blogPostID = req.param('blogPostID', '');
		if(validateVar(email)) {res.send(400); return;};
		if(validateVar(comment)) {res.send(400); return;};
		if(validateVar(name)) {res.send(400); return;};
		if(validateVar(blogPostID)) {res.send(400); return;};
		User.register(email,name, function(account) {
			//found the account
			if(account){
				//must have comment and blogID
				Blog.commentPost(account.displayName, comment, blogPostID, function(results) {
					//return blogID
					if(results && results.id){
						res.json({ 'commentID': results.id });
					} else {
						res.json({ 'commentID': '000000' });
					};
				});
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
		config.emailServer.send({
			text: emailmessage, 
			from: email, 
			to: config.emailAccount,
			subject: "Simple Node Blog"
		}, function(err, message) { 
			//console.log(err || message); 
			res.send(200);
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
		res.render('500', {status: err.status || 500, error: err});
	});
};