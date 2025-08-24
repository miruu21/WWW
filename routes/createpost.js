const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// ✅ Configure Multer for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  }
});

/**
 * @route   POST /api/posts/photo
 * @desc    Create a photo post
 * @body    caption (string)
 * @file    image (image file)
 * @access  Private
 */
router.post('/photo', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const newPost = new Post({
      author: req.user.id,
      text: caption || '',
      imageUrl: `/uploads/posts/${req.file.filename}`,
      type: 'image'
    });

    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating photo post:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/**
 * @route   POST /api/posts/tip
 * @desc    Create a tip/advice post
 * @body    text (string)
 * @access  Private
 */
router.post('/tip', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const newPost = new Post({
      author: req.user.id,
      text,
      type: 'tip'
    });

    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating tip post:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/**
 * @route   POST /api/posts/help
 * @desc    Create a help/question post
 * @body    question (string)
 * @access  Private
 */
router.post('/help', authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const newPost = new Post({
      author: req.user.id,
      question,
      type: 'chat'
    });

    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating help post:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/**
 * @route   POST /api/posts/poll
 * @desc    Create a poll post with options
 * @body    question (string), options (array of strings)
 * @access  Private
 */
router.post('/poll', authMiddleware, async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Question and at least two options are required' });
    }

    const formattedOptions = options.map(option => ({
      text: option,
      votes: 0
    }));

    const newPost = new Post({
      author: req.user.id,
      question,
      type: 'poll',
      pollOptions: formattedOptions
    });

    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating poll post:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
