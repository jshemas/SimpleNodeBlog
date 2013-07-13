module.exports = function(mongoose, winston, config) {
	// Account Schema
	var AccountSchema = new mongoose.Schema({
		password:  { type: String },
		displayName:  { type: String },
		email: { type: String },
		isAdmin: { type: Boolean}
	});

	var Account = mongoose.model('Account', AccountSchema);

	//look up users by email
	var findByEmail = function(email, callback) {
		winston.info('Looking up Email:'+email);
		Account.findOne({email:email}, function(err,results) {
			if(err){
				winston.info('Error in findByEmail:'+err);
				callback();
			} else {
				callback(results);
			};
		});
	};
	
	//login page - used by admin
	var login = function(email, password, callback) {
		winston.info('Login on account:'+email);
		Account.findOne({email:email,password:password},function(err,results){
			//only admins can log in
			if(results && results.isAdmin && results.isAdmin == true){
				winston.info('Admin login:'+results);
				callback(results);
			} else {
				winston.info('Error in login:'+err);
				callback();
			}
		});
	};

	// register - Register the member with some info
	var register = function(email,displayName,callback) {
		// first make sure the user doesn't all ready have an account
		findByEmail(email, function(account) {
			if (!account) {
				// no account was found, so make one
				var user = new Account({
					email: email,
					displayName: displayName,
					isAdmin: 'false'
				});

				// make that user!
				user.save( function(err, results){
					if(err){
						winston.info('Error in register:'+err);
						callback();
					} else {
						callback(results);
					};
				});
			} else {
				// return member doc
				callback(account);
			};
		})
	};

	// running the blog for the first time
	var firstRunBlogUser = function() {
		var testAccount = new Account({
			password: config.password,
			displayName: config.userName,
			email: config.userName,
			isAdmin: true
		});
		// make that user!
		testAccount.save( function(err, results){
			if(err){
				winston.info('Error in firstRunBlogPost:'+err);
			};
		});
	}

	return {
		Account: Account,
		login: login,
		findByEmail: findByEmail,
		register: register,
		firstRunBlogUser: firstRunBlogUser
	};
};