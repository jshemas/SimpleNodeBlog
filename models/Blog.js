module.exports = function(mongoose) {
	// blog schema
	var blogPostSchema = new mongoose.Schema({
		title: { type: String, required: true },
		subTitle: { type: String, required: false },
		tags: { type: String, required: false },
		body: { type: String, required: true },
		author: { type: String, required: false },
		//createdDate: { type: Date, default: Date.now }
	})

	var Blog = mongoose.model('Blog', blogPostSchema);

	var registerCallback = function(err) {
		if (err) {
			return console.log(err);
		};
		return console.log('Blog post was created!');
	};

	// this posts the blog entry
	var blogPost = function(title, subTitle, tags, body, user) {
		var blogPost = new Blog({
			title: title,
			subTitle: subTitle,
			tags: tags,
			body: body,
			author: user.displayName
			//createdDate: 'sometime'
		});
		blogPost.save(registerCallback);
		return ("Worked");
	};

	// gets all blog entry(s)
	var getBlogPost = function(callback) {
		var query = Blog.find();
		query.select('title subTitle body tags author');
		//execute the query at a later time
		query.exec(function (err, blog) {
		if (err) return handleError(err);
			callback(blog);
		})
	};

	// gets one blog entry (note the id pased to it)
	var getSingleBlogPost = function(id, callback) {
		var query = Blog.findOne({_id: id});
		query.select('title subTitle body tags author');
		//execute the query at a later time
		query.exec(function (err, blog) {
		if (err) return handleError(err);
			callback(blog);
		})
	};

	return {
		Blog: Blog,
		blogPost: blogPost,
		getBlogPost: getBlogPost,
		getSingleBlogPost: getSingleBlogPost
	}
};