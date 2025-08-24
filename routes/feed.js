const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // JWT auth

/**
 * @route   GET /api/feed
 * @desc    Get paginated feed posts with filters and sorting
 * @query   filter (All | Resources | Photo Posts | Advice | Ask for Help)
 * @query   sort (newest | most_popular)
 * @query   page (default: 1)
 * @query   limit (default: 10)
 * @access  Private (User must be logged in)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const {
      filter = 'All',
      sort = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    // ✅ 1. Base query
    let query = {};

    // ✅ 2. Apply filter logic
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

    // ✅ 3. Sorting
    let sortOption = {};
    if (sort === 'newest') {
      sortOption.createdAt = -1;
    } else if (sort === 'most_popular') {
      sortOption.likesCount = -1; // Based on number of likes
    }

    // ✅ 4. Fetch posts with pagination
    const posts = await Post.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit)
      .populate('author', 'username avatar') // Include author info
      .lean();

    // ✅ 5. Get total count for pagination
    const total = await Post.countDocuments(query);

    // ✅ 6. Add user-specific like/save info
    const user = await User.findById(userId).select('likedPosts savedPosts').lean();
    const likedPosts = user.likedPosts || [];
    const savedPosts = user.savedPosts || [];

    const feedData = posts.map(post => ({
      id: post._id,
      author: post.author.username,
      authorAvatar: post.author.avatar || null,
      text: post.text || '',
      imageUrl: post.imageUrl || null,
      type: post.type,
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      createdAt: post.createdAt,
      isLiked: likedPosts.includes(post._id.toString()),
      isSaved: savedPosts.includes(post._id.toString())
    }));

    res.json({
      success: true,
      data: feedData,
      pagination: {
        currentPage: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
        totalItems: total,
        hasMore: parsedPage < Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
