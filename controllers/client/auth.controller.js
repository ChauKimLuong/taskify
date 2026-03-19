exports.getLogin = (req, res) => {
  res.render('client/pages/auth/login', {
    title: 'Login'
  });
};

exports.getRegister = (req, res) => {
  res.render('client/pages/auth/register', {
    title: 'Register'
  });
};

const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');

// [GET] /register
exports.getRegister = (req, res) => {
  res.render('client/pages/auth/register', {
    title: 'Register'
  });
};

// [POST] /register
exports.postRegister = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('⚠️ Email already exists');
      return res.send('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    console.log('User created:', newUser);

    res.redirect('/login');
  } catch (error) {
    console.error('Register error:', error);
    res.send('Register failed');
  }
};