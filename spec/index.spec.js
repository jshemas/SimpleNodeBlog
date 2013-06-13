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

//this will be info for the test comment
var commentEmail = 'AutoTest@AutoTest.com',
	commentBody = 'Auto Test - Comment Body',
	commentName = 'Auto Test - Comment Name';

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
