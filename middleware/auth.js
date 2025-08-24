const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Assuming payload has { user: { id: ... } }
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};
