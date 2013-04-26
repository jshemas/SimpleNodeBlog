module.exports = function(email) {
	// config for emailjs for the contact page
	var emailServer  = email.server.connect({
		user: "youremail@gmail.com", 
		password: "yourpassword", 
		host: "smtp.gmail.com", 
		ssl: true
	});
	// the email account you'll be sending it too
	var emailAccount = "youremail@gmail.com"

	return {
		emailServer: emailServer,
		emailAccount: emailAccount
	};
};