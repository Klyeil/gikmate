const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  birth: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, default: 'user' }, // role 필드 추가
  isDormCertified: { type: Boolean, default: false }, // 인증 여부
  applicationStatus: { type: String, default: null }, // 신청 상태
  dorm: { type: String, default: null }, // 선택한 기숙사
});

module.exports = mongoose.model('User', userSchema);