// Code found here: https://developers.facebook.com/docs/howtos/login/getting-started/

// Additional JS functions here
window.fbAsyncInit = function() {
	FB.init({
		appId      : '164713653680312', // App ID
		channelUrl : '//localhost:8080/channel', // Channel File
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});

	//Additional init code here
};

// Load the SDK Asynchronously
(function(d){
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));

function testAPI(blogEvent) {
	FB.api('/me', function(response) {
		response.blogEvent = blogEvent;
		$.ajax({
			type: "POST",
			url: '/fbEvent',
			data: response,
			success: function(data) {
				if(data == 'OK') {
					location.href = blogEvent.location;
				}
			}
		});
	});
}

function login(blogEvent) {
	FB.login(function(response) {
		if (response.authResponse) {
			// connected
			testAPI(blogEvent);
		} else {
			// cancelled
		}
	});
}

function logout() {
	FB.logout(function(response) {
		// user is now logged out
	});
}

function getLoginStatus(blogEvent) {
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			//response.status === 'connected' will be true whenever the User viewing the page is both logged into Facebook and has already previously authorized the current app.
			testAPI(blogEvent);
		} else if (response.status === 'not_authorized') {
			// response.status === 'not_authorized' is true whenever the User viewing the page is logged into Facebook, but has not yet authorized the current app. 
			login(blogEvent);
		} else {
			// The final else statement is true when the User viewing the page is not logged into Facebook, and therefore the state of their authorization of the app is unknown.
			login(blogEvent);
		}
	});
}