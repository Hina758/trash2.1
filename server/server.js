const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth.js');
const scoresRoutes = require('./routes/scores.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// public 폴더의 절대 경로를 지정하여 파일 로딩 오류를 해결합니다.
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);

// 모든 GET 요청은 index.html로 리디렉션 (페이지 새로고침 시 404 방지)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
});