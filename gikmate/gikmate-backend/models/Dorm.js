// models/Dorm.js
const mongoose = require('mongoose');

const dormSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 기숙사 이름
  roleName: { type: String, required: true, unique: true }, // 기숙사별 역할 이름 (예: dorm_member_A)
  region: { type: String, required: true }, // 기숙사 지역 (예: "서울", "부산")
  createdAt: { type: Date, default: Date.now }, // 생성 시간
});

module.exports = mongoose.model('Dorm', dormSchema);