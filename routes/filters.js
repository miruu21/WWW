const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/filters
 * @desc    Get dynamic filter options for the feed
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // These can come from DB in future if customizable
    const filters = [
      { key: 'All', label: 'All Posts' },
      { key: 'Resources', label: 'Resources' },
      { key: 'Photo Posts', label: 'Photo Posts' },
      { key: 'Advice', label: 'Advice & Tips' },
      { key: 'Ask for Help', label: 'Ask for Help' }
    ];

    const sortOptions = [
      { key: 'newest', label: 'Newest' },
      { key: 'most_popular', label: 'Most Popular' }
    ];

    res.json({
      success: true,
      data: {
        filters,
        sortOptions
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
