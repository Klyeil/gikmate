const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Dorm = require('../models/Dorm');

// 기숙사 목록
router.get('/dorms', async (req, res) => {
  try {
    const dorms = await Dorm.find();
    res.json(dorms);
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 기숙사 추가
router.post('/dorms', async (req, res) => {
  const { name, roleName, region } = req.body;
  try {
    const existingDorm = await Dorm.findOne({ name });
    if (existingDorm) {
      return res.status(400).json({ success: false, message: '이미 존재하는 기숙사입니다.' });
    }
    const newDorm = new Dorm({ name, roleName, region });
    await newDorm.save();
    res.json({ success: true, dorm: newDorm });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 기숙사 수정
router.put('/dorms/:id', async (req, res) => {
  const { id } = req.params;
  const { name, roleName, region } = req.body;
  try {
    const dorm = await Dorm.findByIdAndUpdate(id, { name, roleName, region }, { new: true });
    if (!dorm) {
      return res.status(404).json({ success: false, message: '기숙사를 찾을 수 없습니다.' });
    }
    res.json({ success: true, dorm });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 기숙사 삭제
router.delete('/dorms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const dorm = await Dorm.findByIdAndDelete(id);
    if (!dorm) {
      return res.status(404).json({ success: false, message: '기숙사를 찾을 수 없습니다.' });
    }
    // 관련 사용자 데이터 정리 (dorm 필드 초기화)
    await User.updateMany({ dorm: dorm.name }, { $set: { dorm: null, isDormCertified: false, applicationStatus: null } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 기숙사 인증 신청
router.post('/apply-dorm', async (req, res) => {
  const { email, dorm } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { dorm, applicationStatus: 'pending' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ success: true, dorm });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 대기 중인 인증 신청 목록
router.get('/pending-applications', async (req, res) => {
  try {
    const applications = await User.find({ applicationStatus: 'pending' });
    res.json(applications.map(app => ({
      id: app._id,
      email: app.email,
      dorm: app.dorm,
    })));
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 인증 승인/거절 처리
router.post('/assign-role', async (req, res) => {
  const { applicationId, action } = req.body;
  try {
    const user = await User.findById(applicationId);
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    if (action === 'approve') {
      const dorm = await Dorm.findOne({ name: user.dorm });
      if (!dorm) {
        return res.status(404).json({ success: false, message: '기숙사를 찾을 수 없습니다.' });
      }
      user.isDormCertified = true;
      user.applicationStatus = 'approved';
      user.role = dorm.roleName;
    } else {
      user.applicationStatus = 'rejected';
      user.dorm = null;
    }
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;