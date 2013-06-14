var request = require('supertest'),
	expect = require('expect.js');
console.log("Starting Tests");

//enter your domain
var baseURL = "http://localhost:8080/";

//admin login info
var adminName = 'email',
	adminPassword = 'password';

//store the admin login cookie
var cookie;

//this will be info for the admin blog post
var title = 'Auto Test - Title',
	subTitle = 'Auto Test - subTitle',
	tags = 'Auto Test - Tags',
	body = 'Auto Test - Body';

//store that blog post we made
var blogID;

//store that comment we made
var CommentID;

//this will be info for the test comment
var commentEmail = 'AutoTest@AutoTest.com',
	commentBody = 'Auto Test - Comment Body',
	commentName = 'Auto Test - Comment Name';

//append this to edit posts
var edit = '[EDIT]';

//sometimes error don't show in the log...
//http://stackoverflow.com/questions/8794008/no-stack-trace-for-jasmine-node-errors
process.on('uncaughtException',function(e) {
	console.log("Caught unhandled exception: " + e);
	console.log(" ---> : " + e.stack);
});

describe('GET - Load Static Pages:', function (done) {
	it('Hompage', function(done) {
		request(baseURL)
			.get('')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Bloglist', function(done) {
		request(baseURL)
			.get('bloglist')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('About', function(done) {
		request(baseURL)
			.get('about')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Contact', function(done) {
		request(baseURL)
			.get('contact')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Login', function(done) {
		request(baseURL)
			.get('login')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Admin', function(done) {
		request(baseURL)
			.get('admin')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(302);
				done();
			});
	});
	it('404 error page', function(done) {
		request(baseURL)
			.get('404page')
			.end( function(err, result) {
				// response from our service
				// this is just testing if we send a 404 code back
				expect(result.res.statusCode).to.be(404);
				done();
			});
	});
});

describe('POST - Admin Login:', function (done) {
	it('bad login info', function(done) {
		request(baseURL)
			.post('userlogin?email=test&password=test')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(401);
				done();
			});
	});
	it('bad login info - no email', function(done) {
		request(baseURL)
			.post('userlogin?password=test')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('bad login info - no password', function(done) {
		request(baseURL)
			.post('userlogin?email=test')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('good login info', function(done) {
		request(baseURL)
			.post('userlogin?email='+adminName+'&password='+adminPassword)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				cookie = result.headers['set-cookie'].pop().split(';')[0];
				done();
			});
	});
	it('Admin login confirm', function(done) {
		var testRequest = request(baseURL).get('admin');
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
});

describe('POST - Admin Blog Post:', function (done) {
	it('Valid Admin Blog Post', function(done) {
		var testRequest = request(baseURL).post('postBlogNow?title='+title+'&body='+body+'&subTitle='+subTitle+'&tags='+tags);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				blogID = result.body.blogID;
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Valid Single Post Page', function(done) {
		request(baseURL)
			.get('blog/'+blogID)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Invalid Admin Blog Post - no title', function(done) {
		var testRequest = request(baseURL).post('postBlogNow?'+'body='+body+'&subTitle='+subTitle+'&tags='+tags);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Blog Post - no body', function(done) {
		var testRequest = request(baseURL).post('postBlogNow?title='+title+'&subTitle='+subTitle+'&tags='+tags);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Blog Post - not login', function(done) {
		var testRequest = request(baseURL).post('postBlogNow?title='+title+'&subTitle='+subTitle+'&tags='+tags);
		testRequest.cookies = '';
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
});

describe('POST - Adding Comments:', function (done) {
	it('valid user comment', function(done) {
		request(baseURL)
			.post('postCommentNow?email='+commentEmail+'&comment='+commentBody+'&name='+commentName+'&blogPostID='+blogID)
			.end( function(err, result) {
				// response from our service
				commentID = result.body.commentID;
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('invalid user comment - no email', function(done) {
		request(baseURL)
			.post('postCommentNow?comment='+commentBody+'&name='+commentName+'&blogPostID='+blogID)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('invalid user comment - no comment', function(done) {
		request(baseURL)
			.post('postCommentNow?name='+commentName+'&blogPostID='+blogID+'&email='+commentEmail)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('invalid user comment - no name', function(done) {
		request(baseURL)
			.post('postCommentNow?comment='+commentBody+'&blogPostID='+blogID+'&email='+commentEmail)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('invalid user comment - no blogID', function(done) {
		request(baseURL)
			.post('postCommentNow?comment='+commentBody+'&name='+commentName+'&email='+commentEmail)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
});

describe('POST - Edit Blog Post:', function (done) {
	it('Valid Admin Edit Blog Post', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?theBlogID='+blogID+'&editTitle='+title+edit+'&editBody='+body+edit+'&editSubTitle='+subTitle+edit+'&editTags='+tags+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Invalid Admin Edit Blog Post - invalid blogID', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?theBlogID='+blogID+edit+'&editTitle='+title+edit+'&editBody='+body+edit+'&editSubTitle='+subTitle+edit+'&editTags='+tags+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Post - no blogID', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?editTitle='+title+edit+'&editBody='+body+edit+'&editSubTitle='+subTitle+edit+'&editTags='+tags+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Post - no title', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?theBlogID='+blogID+edit+'&editBody='+body+edit+'&editSubTitle='+subTitle+edit+'&editTags='+tags+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Post - no body', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?theBlogID='+blogID+edit+'&editTitle='+title+edit+'&editSubTitle='+subTitle+edit+'&editTags='+tags+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Post - no subTitle', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?theBlogID='+blogID+edit+'&editTitle='+title+edit+'&editBody='+body+edit+'&editTags='+tags+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Post - no tags', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?theBlogID='+blogID+edit+'&editTitle='+title+edit+'&editBody='+body+edit+'&editSubTitle='+subTitle+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Post - not login', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogNow?theBlogID='+blogID+'&editTitle='+title+edit+'&editBody='+body+edit+'&editSubTitle='+subTitle+edit+'&editTags='+tags+edit);
		testRequest.cookies = '';
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
});

describe('POST - Edit Blog Post Comments:', function (done) {
	it('Valid Admin Edit Blog Comment', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theCommentID='+commentID+'&theBlogID='+blogID+'&editAuthor='+commentName+edit+'&editBody='+commentBody+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Invalid Admin Edit Blog Comment - invalid blogID', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theCommentID='+commentID+'&theBlogID='+blogID+edit+'&editAuthor='+commentName+edit+'&editBody='+commentBody+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Comment - invalid commentID', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theCommentID='+commentID+edit+'&theBlogID='+blogID+'&editAuthor='+commentName+edit+'&editBody='+commentBody+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Comment - no blogID', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theCommentID='+commentID+'&editAuthor='+commentName+edit+'&editBody='+commentBody+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Comment - no commentID', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theBlogID='+blogID+'&editAuthor='+commentName+edit+'&editBody='+commentBody+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Comment - no comment', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theCommentID='+commentID+'&theBlogID='+blogID+'&editAuthor='+commentName+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Comment - no name', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theCommentID='+commentID+'&theBlogID='+blogID+'&editBody='+commentBody+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Edit Blog Commen- not login', function(done) {
		var testRequest = request(baseURL).post('admin/editBlogCommentNow?theCommentID='+commentID+'&theBlogID='+blogID+'&editAuthor='+commentName+edit+'&editBody='+commentBody+edit);
		testRequest.cookies = '';
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
});

describe('POST - Delete Blog Post Comment:', function (done) {
	it('Invalid Admin Delete Blog Comment - not login', function(done) {
		var testRequest = request(baseURL).post('admin/deleteCommentNow?theCommentID='+commentID+'&theBlogID='+blogID);
		testRequest.cookies = '';
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Delete Blog Comment - bad blod ID', function(done) {
		var testRequest = request(baseURL).post('admin/deleteCommentNow?theCommentID='+commentID+'&theBlogID='+blogID+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Delete Blog Comment - bad comment ID', function(done) {
		var testRequest = request(baseURL).post('admin/deleteCommentNow?theCommentID='+commentID+edit+'&theBlogID='+blogID);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Delete Blog Comment - no blogID', function(done) {
		var testRequest = request(baseURL).post('admin/deleteCommentNow?theCommentID='+commentID);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Delete Blog Comment - no commentID', function(done) {
		var testRequest = request(baseURL).post('admin/deleteCommentNow?theBlogID='+blogID);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Valid Admin Delete Blog Comment', function(done) {
		var testRequest = request(baseURL).post('admin/deleteCommentNow?theCommentID='+commentID+'&theBlogID='+blogID);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
});

describe('POST - Delete Blog Post Comment:', function (done) {
	it('Invalid Admin Delete Blog Post - not login', function(done) {
		var testRequest = request(baseURL).post('admin/deleteBlogNow?theBlogID='+blogID);
		testRequest.cookies = '';
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Delete Blog Post - no blog ID', function(done) {
		var testRequest = request(baseURL).post('admin/deleteBlogNow');
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Invalid Admin Delete Blog Post - bad blog ID', function(done) {
		var testRequest = request(baseURL).post('admin/deleteBlogNow?theBlogID='+blogID+edit);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(400);
				done();
			});
	});
	it('Valid Admin Delete Blog Post', function(done) {
		var testRequest = request(baseURL).post('admin/deleteBlogNow?theBlogID='+blogID);
		testRequest.cookies = cookie;
		testRequest.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
});

	// /*
	//  * POST Admin Page - Delete Blog Post
	//  */
	// app.post('/admin/deleteBlogNow', function(req, res){
	// 	var blogID = req.param('theBlogID', '');
	// 	//must have a ID
	// 	if(validateVar(blogID)) {res.send(400); return;};
	// 	//must be logged in
	// 	if (req.session.loggedIn != true) {res.send(400); return;};
	// 	Blog.blogDeletePost(blogID, function(results) {
	// 		if(results == 1){
	// 			res.send(200);
	// 		} else {
	// 			res.send(400);
	// 		};
	// 	});
	// });
