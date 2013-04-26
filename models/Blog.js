module.exports = function(mongoose) {
	var Comment = new mongoose.Schema({
		author: { type: String, required: true },
		body: { type: String, required: true }
	});

	// blog schema
	var blogPostSchema = new mongoose.Schema({
		title: { type: String, required: true },
		subTitle: { type: String, required: false },
		tags: { type: String, required: false },
		body: { type: String, required: true },
		author: { type: String, required: false },
		createdDate: { type: Date, default: Date.now },
		comment: [Comment]
	});

	var Blog = mongoose.model('Blog', blogPostSchema);

	// this posts the blog entry
	var blogPost = function(title, subTitle, tags, body, user) {
		var blogPost = new Blog({
			title: title,
			subTitle: subTitle,
			tags: tags,
			body: body,
			author: user
		});
		// make that blog post!
		blogPost.save( function(err, results){
			// should we log err?
		});
	};

	// gets all blog entry(s)
	var getBlogPost = function(callback) {
		var query = Blog.find().sort('-createdDate');
		query.select('title subTitle tags body _id createdDate');
		//execute the query at a later time
		query.exec(function (err, blog) {
		if (err) return handleError(err);
			callback(blog);
		})
	};

	// gets one blog entry (note the id pased to it)
	var getSingleBlogPost = function(id, callback) {
		var query = Blog.findOne({_id: id});
		query.select('title subTitle body tags author createdDate comment');
		query.exec(function(err, results){
			// Check for an error   
			if(err){ //log error?
				callback();
			} else{
				callback(results);
			};
		});
	};

	return {
		Blog: Blog,
		blogPost: blogPost,
		getBlogPost: getBlogPost,
		getSingleBlogPost: getSingleBlogPost
	};
};