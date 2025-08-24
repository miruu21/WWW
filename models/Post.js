const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  option: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['photo', 'tip', 'help', 'poll'],
    required: true
  },
  text: { type: String },
  imageUrl: { type: String }, // for photo posts
  question: { type: String }, // for poll or help posts
  pollOptions: [pollOptionSchema], // only if type is poll
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  commentsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
