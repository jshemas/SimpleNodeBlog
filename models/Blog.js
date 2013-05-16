module.exports = function(mongoose, winston) {
	//TODO - store comment email
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
		winston.info('Loading Blod ID:'+id);
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

	// edit that blog post!
	var blogEditPost = function(title, subTitle, tags, body, user, blogID){
		var blogUpdate = { $set: { 
			title: title,
			subTitle: subTitle,
			tags: tags,
			body: body,
			author: user
		}};
		Blog.update({_id:blogID},blogUpdate,{upsert: true}, function(err, results){ 
			// should we log err?
		});
	};

	//  delete that blog post!
	var blogDeletePost = function(blogID){
		Blog.find({_id:blogID}).remove();
		//log this?
	};

	// edit that blog comment!
	var blogEditComment = function(author, body, user, theCommentID, blogID){
		// maybe we should log when this is edited
		var commentUpdate = { $set: { 
			'comment.$.body': body,
			'comment.$.author': author
		}};
		Blog.update({_id:blogID, 'comment._id':theCommentID},commentUpdate,{upsert: true}, function(err, results){ 
			// should we log err?
		});
	};

	// delete that blog comment!
	var blogDeleteComment = function(theCommentID, blogID){
		var commentUpdate = { $pull: { 
			comment:{_id:theCommentID}
		}};
		Blog.update({_id:blogID},commentUpdate, function(err, results){ 
			// should we log err?
		});
	};

	return {
		Blog: Blog,
		blogPost: blogPost,
		getBlogPost: getBlogPost,
		getSingleBlogPost: getSingleBlogPost,
		blogEditPost: blogEditPost,
		blogDeletePost: blogDeletePost,
		blogEditComment: blogEditComment,
		blogDeleteComment: blogDeleteComment
	};
};