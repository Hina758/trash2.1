const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth.js');
const scoresRoutes = require('./routes/scores.js');
const matchRoutes = require('./routes/match.js');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 미들웨어 설정 ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 정적 파일 제공 ---
// public 폴더 안의 모든 파일(html, css, js)을 제공합니다.
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API 라우트 설정 ---
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/match', matchRoutes);

// app.get('*', ...) 부분이 삭제되었습니다.

app.listen(PORT, () => {
    console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
});