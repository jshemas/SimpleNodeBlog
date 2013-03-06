module.exports = function(app, passport, FacebookStrategy, mongoose, User){
	// FACKBOOK app info
	var FACEBOOK_APP_ID = "164713653680312"
	var FACEBOOK_APP_SECRET = "e5bfea540889ee43b2f76ae3f048a56e";

	// Passport session setup.
	//   To support persistent login sessions, Passport needs to be able to
	//   serialize users into and deserialize users out of the session.  Typically,
	//   this will be as simple as storing the user ID when serializing, and finding
	//   the user by ID when deserializing.  However, since this example does not
	//   have a database of user records, the complete Facebook profile is serialized
	//   and deserialized.
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	// Use the FacebookStrategy within Passport.
	//   Strategies in Passport require a `verify` function, which accept
	//   credentials (in this case, an accessToken, refreshToken, and Facebook
	//   profile), and invoke a callback with a user object.
	passport.use(new FacebookStrategy({clientID: FACEBOOK_APP_ID, clientSecret: FACEBOOK_APP_SECRET, callbackURL: "http://localhost:8080/auth/facebook/callback"}, function(accessToken, refreshToken, profile, done) {
		// asynchronous verification, for effect...
		process.nextTick(function () {
			//console.log(profile); //outputs info from facebook
			User.findByUsername(profile.username, function(account) {
				if (!account) {
					//no accout was found, so make one
					User.register(profile.name.givenName, profile.name.familyName, profile.provider, profile.gender,profile.profileUrl,profile.username);
					return done(null, false, { message: 'Unknown user ' + profile.username }); //this needs to be re written
				}
				return done(null, account);
			})
		});
	}));

	// GET /auth/facebook
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in Facebook authentication will involve
	//   redirecting the user to facebook.com.  After authorization, Facebook will
	//   redirect the user back to this application at /auth/facebook/callback
	app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){
	// The request will be redirected to Facebook for authentication, so this
	// function will not be called.
	});

	// GET /auth/facebook/callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
		res.redirect('/');
	});
};