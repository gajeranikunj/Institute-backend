const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin'); // if you have separate admin model
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await Admin.findById(decoded.id).select('-password');
    if (user) {
      req.user = { ...user._doc, role: 'admin' };
    } else {
      user = await Faculty.findById(decoded.id).select('-password');
      if (user) req.user = { ...user._doc, role: 'faculty' };
    }

    if (!req.user) return res.status(401).json({ message: "User not found" });

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};


const adminOnly = (req, res, next) => {
  // console.log(req.user);
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ message: 'Admin only access' });
};

module.exports = { protect, adminOnly };
