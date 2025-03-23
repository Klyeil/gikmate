const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

router.post('/signup', async (req, res) => {
  const { email, password, name, birth, address } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '이미 존재하는 이메일입니다.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      birth,
      address,
      role: 'user',
    });
    await newUser.save();
    res.json({ success: true, message: '회원가입 성공' });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' });
    }
    const token = jwt.sign(
      { email: user.email, role: user.role },
      'secretkey',
      { expiresIn: '1h' }
    );
    res.json({
      success: true,
      token,
      user: { email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

router.post('/verify-token', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        isDormCertified: user.isDormCertified,
        applicationStatus: user.applicationStatus,
        dorm: user.dorm,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '사용자 정보를 가져오는 데 실패했습니다.' });
  }
});

// 모든 사용자 목록
router.get('/users', authenticateToken, async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ success: false, message: '서버 오류' });
    }
  });
  
  // 사용자 역할 변경
  router.put('/users/:id/role', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
      const user = await User.findByIdAndUpdate(id, { role }, { new: true });
      if (!user) {
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
      }
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: '서버 오류' });
    }
  });

  
module.exports = router;