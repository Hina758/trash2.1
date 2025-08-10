// server/server.js

const express = require('express');
const path = require('path');

// 라우터 가져오기 (파일 확장자 .js 추가!)
const authRoutes = require('./routes/auth.js');
const scoresRoutes = require('./routes/scores.js');
const matchRoutes = require('./routes/match.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
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