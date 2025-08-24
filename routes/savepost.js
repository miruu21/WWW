const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/posts/:id/save
 * @desc    Save or Unsave a post (Bookmark)
 * @access  Private
 */
router.post('/:id/save', authMiddleware, async (req, res) => {
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

    let saved = false;

    // Check if user already saved this post
    if (user.savedPosts && user.savedPosts.includes(postId)) {
      // Unsave
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId.toString());
      saved = false;
    } else {
      // Save
      if (!user.savedPosts) {
        user.savedPosts = [];
      }
      user.savedPosts.push(postId);
      saved = true;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        postId: post._id,
        saved
      }
    });
  } catch (error) {
    console.error('Error toggling save:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
