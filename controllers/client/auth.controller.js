

const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// [GET] /login
exports.getLogin = (req, res) => {
  res.render('client/pages/auth/login', {
    title: 'Login'
  });
};


exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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

    res.json({
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




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