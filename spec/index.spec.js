var request = require('supertest');
console.log("Starting Tests");

//enter your domain
var baseURL = "http://localhost:8080/";

//enter your admin account
var adminName = "email";
var adminPassword = "password";

describe('GET - Load Static Pages:', function (done) {
	it('Hompage', function(done) {
		request(baseURL)
			.get('')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(200);
				done();
			});
	});
	it('Bloglist', function(done) {
		request(baseURL)
			.get('bloglist')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(200);
				done();
			});
	});
	it('About', function(done) {
		request(baseURL)
			.get('about')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(200);
				done();
			});
	});
	it('Contact', function(done) {
		request(baseURL)
			.get('contact')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(200);
				done();
			});
	});
	it('Login', function(done) {
		request(baseURL)
			.get('login')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(200);
				done();
			});
	});
	it('Admin', function(done) {
		request(baseURL)
			.get('admin')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(302);
				done();
			});
	});
	it('404 error page', function(done) {
		request(baseURL)
			.get('404page')
			.end( function(err, result) {
				// response from our service
				// this is just testing if we send a 404 code back
				expect(result.res.statusCode).toBe(404);
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
				expect(result.res.statusCode).toBe(401);
				done();
			});
	});
	it('good login info', function(done) {
		request(baseURL)
			.post('userlogin?email='+adminName+'&password='+adminPassword)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(200);
				done();
			});
	});
});
