const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// in server.js, near top
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// Allow your app/website origins here
const allowed = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://10.0.2.2:3000',     // Android emulator
  'https://herhub.app',        // your web app (change to your domain)
  'https://api.herhub.app'     // your API domain
];
app.use(cors({ origin: allowed, credentials: false }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

app.use('/api/feed', require('./routes/feed'));             // Main feed
app.use('/api/feed/refresh', require('./routes/refreshfeed')); // Refresh feed
app.use('/api/posts', require('./routes/createpost'));      // Create post
app.use('/api/posts', require('./routes/likepost'));        // Like/unlike
app.use('/api/posts', require('./routes/savepost'));        // Save/unsave
app.use('/api/posts', require('./routes/postdetails'));     // Post details
app.use('/api/filters', require('./routes/filters'));       // Filters

// in server.js, before app.listen
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));


