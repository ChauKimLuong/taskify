const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// [GET] /login
exports.getLogin = (req, res) => {
  res.render('client/pages/auth/login', {
    title: 'Login',
    error: req.query.error || '',
  });
};

// [GET] /logout
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
  });
  return res.redirect('/login');
};

// [POST] /login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || user.is_deleted) {
      return res.redirect('/login?error=invalid_credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.redirect('/login?error=invalid_credentials');
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // All users go to the same dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// [GET] /sign-up
exports.getRegister = (req, res) => {
  res.render('client/pages/auth/register', {
    title: 'Register',
    error: req.query.error || '',
  });
};

// [POST] /sign-up
exports.postRegister = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.redirect('/sign-up?error=email_exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        full_name: full_name || null,
        email,
        password_hash: hashedPassword,
        system_role: 'user',
      },
    });

    res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error);
    res.redirect('/sign-up?error=server_error');
  }
};
