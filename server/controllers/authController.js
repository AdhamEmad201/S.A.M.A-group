const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة.' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'تم تسجيل الدخول بنجاح.',
      token,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم.', error: error.message });
  }
};

const verifyToken = (req, res) => {
  res.json({ valid: true, admin: req.admin });
};

module.exports = { login, verifyToken };
