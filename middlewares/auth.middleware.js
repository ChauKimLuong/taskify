const jwt = require("jsonwebtoken");
const prisma = require('../config/prisma');

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return res.redirect("/login");
    }
    res.locals.user = user;
    console.log(res.locals.user); 
  
    next();
  } catch (err) {
    return res.redirect("/login");
  }
};

module.exports = requireAuth;