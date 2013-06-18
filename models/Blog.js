module.exports = function(mongoose, winston) {
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
	var blogPost = function(title, subTitle, tags, body, user, callback) {
		var blogPost = new Blog({
			title: title,
			subTitle: subTitle,
			tags: tags,
			body: body,
			author: user
		});
		// make that blog post!
		blogPost.save( function(err, results){
			if(err){
				winston.info('Error in blogPost:'+err);
				callback();
			} else {
				callback(results);
			};
		});
	};

	// this posts the comment
	var commentPost = function(displayName, comment, blogPostID, callback) {
		//find blog 
		getSingleBlogPost(blogPostID, function(blog) {
			comment = {
				author: displayName,
				body: comment
			};
			//test if we got a blog object back
			if(blog._id){
				//add comment
				blog.comment.push(comment);
				blog.save( function(err, results){
					if(err){
						winston.info('Error in commentPost:'+err);
						callback();
					} else {
						callback(results);
					};
				});
			} else {
				callback();
			};
		});
	};

	// gets all blog entry(s)
	var getBlogPost = function(callback) {
		var query = Blog.find().sort('-createdDate');
		query.select('title subTitle tags body _id createdDate');
		//execute the query at a later time
		query.exec(function (err, results) {
			if(err){
				winston.info('Error in getBlogPost:'+err);
				callback();
			} else {
				callback(results);
			};
		})
	};

	// gets one blog entry (note the id pased to it)
	var getSingleBlogPost = function(id, callback) {
		var query = Blog.findOne({_id: id});
		query.select('title subTitle body tags author createdDate comment');
		query.exec(function(err, results){
			if(err){
				winston.info('Error in getSingleBlogPost:'+err);
				callback();
			} else {
				callback(results);
			};
		});
	};

	// edit that blog post!
	var blogEditPost = function(title, subTitle, tags, body, user, blogID, callback){
		var blogUpdate = { $set: { 
			title: title,
			subTitle: subTitle,
			tags: tags,
			body: body,
			author: user
		}};
		Blog.update({_id:blogID},blogUpdate,{upsert: true}, function(err, results){ 
			if(err){
				winston.info('Error in blogEditPost:'+err);
				callback();
			} else {
				callback(results);
			};
		});
	};

	//  delete that blog post!
	var blogDeletePost = function(blogID, callback){
		Blog.find({_id:blogID}).remove(function(err, results){
			if(err){
				winston.info('Error in blogDeletePost:'+err);
				callback();
			} else {
				callback(results);
			};
		});
	};

	// edit that blog comment!
	var blogEditComment = function(author, body, user, theCommentID, blogID, callback){
		// maybe we should log when this is edited
		var commentUpdate = { $set: { 
			'comment.$.body': body,
			'comment.$.author': author
		}};
		Blog.update({_id:blogID, 'comment._id':theCommentID},commentUpdate,{upsert: true}, function(err, results){ 
			if(err){
				winston.info('Error in blogEditComment:'+err);
				callback();
			} else {
				callback(results);
			};
		});
	};

	// delete that blog comment!
	var blogDeleteComment = function(theCommentID, blogID, callback){
		var commentUpdate = { $pull: { 
			comment:{_id:theCommentID}
		}};
		Blog.update({_id:blogID},commentUpdate, function(err, results){ 
			if(err){
				winston.info('Error in blogDeleteComment:'+err);
				callback();
			} else {
				callback(results);
			};
		});
	};

	// running the blog for the first time
	var firstRunBlogPost = function() {
		var testPost = new Blog({
			title: 'Test Title',
			subTitle: 'Test SubTitle',
			body: 'Body Test',
			tags: 'Test Tags, Test Tags, Test Tags',
			author: 'Test Author'
		});
		// make that blog post!
		testPost.save( function(err, results){
			if(err){
				winston.info('Error in firstRunBlogPost:'+err);
			};
		});
	}

	return {
		Blog: Blog,
		blogPost: blogPost,
		commentPost: commentPost,
		getBlogPost: getBlogPost,
		getSingleBlogPost: getSingleBlogPost,
		blogEditPost: blogEditPost,
		blogDeletePost: blogDeletePost,
		blogEditComment: blogEditComment,
		blogDeleteComment: blogDeleteComment,
		firstRunBlogPost: firstRunBlogPost
	};
};