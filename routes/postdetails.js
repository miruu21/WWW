const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/posts/:id
 * @desc    Get full details of a single post (with author details, comments, like/save status)
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Fetch post with author details and comments populated
    const post = await Post.findById(postId)
      .populate('author', 'name username avatar') // author details
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name username avatar' }, // nested populate for comments author
        options: { sort: { createdAt: -1 } } // latest comments first
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check like status
    const liked = post.likes && post.likes.includes(userId);

    // Check save status
    const user = await User.findById(userId).select('savedPosts');
    const saved = user.savedPosts && user.savedPosts.includes(postId);

    // Build response with essential details
    const postDetails = {
      id: post._id,
      author: {
        id: post.author._id,
        name: post.author.name,
        username: post.author.username,
        avatar: post.author.avatar
      },
      type: post.type,
      text: post.text || '',
      imageUrl: post.imageUrl || '',
      question: post.question || '',
      pollOptions: post.pollOptions || [],
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      liked,
      saved,
      createdAt: post.createdAt,
      comments: post.comments.map(c => ({
        id: c._id,
        text: c.text,
        author: {
          id: c.author._id,
          name: c.author.name,
          username: c.author.username,
          avatar: c.author.avatar
        },
        createdAt: c.createdAt
      }))
    };

    res.json({
      success: true,
      data: postDetails
    });
  } catch (error) {
    console.error('Error fetching post details:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
