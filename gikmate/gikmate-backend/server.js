const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// 라우터 임포트
const authRoutes = require('./routes/authRoutes');
const dormRoutes = require('./routes/dormRoutes'); // 새로 추가

// 라우터 사용
app.use('/api/auth', authRoutes);
app.use('/api/dorm', dormRoutes); // 기숙사 관련 라우트 추가

// 공지사항 목록
app.get('/api/notices', async (req, res) => {
  const Notice = require('./models/Notice');
  const notices = await Notice.find();
  res.json(notices);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));