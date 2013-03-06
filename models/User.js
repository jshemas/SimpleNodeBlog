module.exports = function(mongoose) {
	// Account Schema
	var AccountSchema = new mongoose.Schema({
		password:  { type: String },
		first_name:  { type: String },
		last_name:  { type: String },
		provider:  { type: String },
		gender:  { type: String },
		profileUrl:  { type: String },
		displayName:  { type: String }
	});

	var Account = mongoose.model('Account', AccountSchema);

	var registerCallback = function(err) {
		if (err) {
			return console.log(err);
		};
		return console.log('User was created!');
	};

	//finds account by user name
	var findByUsername = function(accountId, callback) {
		Account.findOne({displayName:accountId}, function(err,doc) {
			callback(doc);
		});
	};

	//register the user with all this info
	var register = function(first,last,provider,gender,profileUrl,displayName) {
		var user = new Account({
			first_name: first,
			last_name: last,
			provider: provider,
			gender: gender,
			profileUrl: profileUrl,
			displayName: displayName
		});
		user.save(registerCallback);
	};

	return {
		Account: Account,
		findByUsername: findByUsername,
		register: register
	}
};