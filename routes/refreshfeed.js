const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/feed?since=<timestamp>&filter=<filter>&sort=<sort>
 * @desc    Fetch new posts created after a specific timestamp (for pull-to-refresh)
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { since, filter = 'All', sort = 'newest', limit = 10 } = req.query;

    if (!since) {
      return res.status(400).json({ success: false, message: 'since timestamp is required' });
    }

    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid since timestamp' });
    }

    // Base query
    let query = {
      createdAt: { $gt: sinceDate }
    };

    // Apply filter
    if (filter !== 'All') {
      switch (filter) {
        case 'Resources':
          query.type = 'resource';
          break;
        case 'Photo Posts':
          query.type = 'image';
          break;
        case 'Advice':
          query.type = 'tip';
          break;
        case 'Ask for Help':
          query.type = 'chat';
          break;
      }
    }

    // Sorting
    let sortOption = {};
    if (sort === 'newest') {
      sortOption.createdAt = -1;
    } else if (sort === 'most_popular') {
      sortOption.likesCount = -1;
    }

    const posts = await Post.find(query)
      .sort(sortOption)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error refreshing feed:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
