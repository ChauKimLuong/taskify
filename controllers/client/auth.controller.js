

const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { AVAILABLE_ROLES, getDashboardPathByRole, normalizeRole } = require('../../helpers/role.helper');

// [GET] /login
exports.getLogin = (req, res) => {
  res.render('client/pages/auth/login', {
    title: 'Login',
    error: req.query.error || ''
  });
};

// [GET] /logout
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false
  });

  return res.redirect('/login');
};


exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.redirect('/login?error=invalid_credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.redirect('/login?error=invalid_credentials');
    }

    // 🔐 Tạo token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 Lưu vào cookie
    res.cookie("token", token, {
      httpOnly: true, // chống XSS
      secure: false,  // true nếu deploy https
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.redirect(getDashboardPathByRole(user.role));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




// [GET] /sign-up
exports.getRegister = (req, res) => {
  res.render('client/pages/auth/register', {
    title: 'Register'
  });
};

// [POST] /sign-up
exports.postRegister = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log("Email already exists");
      return res.redirect('/sign-up');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        role: AVAILABLE_ROLES.MEMBER
      }
    });

    console.log('User created:', newUser);

    res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error);
    res.redirect('/sign-up');
  }
};

// [POST] /pm/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const nextRole = normalizeRole(req.body.role);
    const allowedRoles = [AVAILABLE_ROLES.TEAM_LEADER, AVAILABLE_ROLES.MEMBER];

    if (!targetUserId || !allowedRoles.includes(nextRole)) {
      return res.redirect('/pm/dashboard?roleUpdate=invalid');
    }

    const targetUser = await prisma.users.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.redirect('/pm/dashboard?roleUpdate=not_found');
    }

    if (targetUser.id === res.locals.user.id) {
      return res.redirect('/pm/dashboard?roleUpdate=self_locked');
    }

    if (normalizeRole(targetUser.role) === AVAILABLE_ROLES.PROJECT_MANAGER) {
      return res.redirect('/pm/dashboard?roleUpdate=pm_locked');
    }

    await prisma.users.update({
      where: { id: targetUserId },
      data: {
        role: nextRole,
      },
    });

    return res.redirect('/pm/dashboard?roleUpdate=success');
  } catch (error) {
    console.error('Update role error:', error);
    return res.redirect('/pm/dashboard?roleUpdate=error');
  }
};
