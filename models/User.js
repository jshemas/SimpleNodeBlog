module.exports = function(mongoose) {
	// Account Schema
	var AccountSchema = new mongoose.Schema({
		password:  { type: String },
		first_name:  { type: String },
		last_name:  { type: String },
		provider:  { type: String },
		provider_id:  { type: String },
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

	//finds account by provider ID
	var findByProviderID = function(accountId, callback) {
		Account.findOne({provider_id:accountId}, function(err,doc) {
			callback(doc);
		});
	};

	//register the user with all this info
	var register = function(first,last,provider,provider_id,gender,profileUrl,displayName,callback) {
		findByProviderID(provider_id, function(account) {
			if (!account) {
					//no accout was found, so make one
					console.log("not account found for reg");
					var user = new Account({
						first_name: first,
						last_name: last,
						provider: provider,
						provider_id: provider_id,
						gender: gender,
						profileUrl: profileUrl,
						displayName: displayName
					});
					user.save(registerCallback);
			}
			callback(account);
		})
	};

	return {
		Account: Account,
		findByProviderID: findByProviderID,
		register: register
	}
};