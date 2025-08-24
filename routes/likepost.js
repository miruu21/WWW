const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like or Unlike a post
 * @access  Private
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let liked = false;

    // Check if user already liked this post
    if (post.likes && post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      post.likesCount = Math.max(0, post.likesCount - 1);
      liked = false;
    } else {
      // Like
      if (!post.likes) {
        post.likes = [];
      }
      post.likes.push(userId);
      post.likesCount = (post.likesCount || 0) + 1;
      liked = true;
    }

    await post.save();

    res.json({
      success: true,
      data: {
        postId: post._id,
        likesCount: post.likesCount,
        liked
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

