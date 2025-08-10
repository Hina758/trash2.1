const express = require('express');
const path = require('path');
const cors = require('cors'); // CORS 라이브러리 불러오기

// 라우터 가져오기
const authRoutes = require('./routes/auth.js');
const scoresRoutes = require('./routes/scores.js');
const matchRoutes = require('./routes/match.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // CORS 미들웨어 사용! (가장 위에 추가)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// 기본 경로 접속 시 index.html 표시
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/match', matchRoutes);

// 서버 실행
app.listen(PORT, () => {
    console.log(`🐘 Trash Game V2.0 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`서버 주소: http://localhost:${PORT}`);
});