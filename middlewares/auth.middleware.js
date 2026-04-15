const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.is_deleted) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    res.locals.user = user;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

module.exports = requireAuth;