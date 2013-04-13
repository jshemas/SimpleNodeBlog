module.exports = function(mongoose) {
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
		Account.findOne({email:email}, function(err,doc) {
			callback(doc);
		});
	};
	
	//login page - used by admin
	var login = function(email, password, callback) {
		Account.findOne({email:email,password:password},function(err,doc){
			//only admins can log in
			if(doc.isAdmin == true){
				console.log("dszf");
				callback(doc);
			} else {
				console.log("dszfff",doc);
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
					// should we log err?
					callback(results);
				});
			} else {
				// return member doc
				callback(account);
			};
		})
	};

	return {
		Account: Account,
		login: login,
		findByEmail: findByEmail,
		register: register
	}
};