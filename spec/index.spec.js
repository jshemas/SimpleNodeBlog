var request = require('supertest');
console.log("Starting Tests");

//enter your domain
var baseURL = "http://localhost:8080/";

describe('View the homepage', function (done) {
	it('user goes to the home page and it loads', function(done) {
		request(baseURL)
			.get('')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).toBe(200);
				done();
			});
	});
});
