const express = require('express');
const path = require('path');
const cors = require('cors');

// 이 파일들은 이제 server.js와 같은 폴더에 있다고 가정합니다.
const authRoutes = require('./routes/auth.js');
const scoresRoutes = require('./routes/scores.js');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 미들웨어 설정 ---
app.use(cors());
app.use(express.json());

// --- 1. 정적 파일 제공 (가장 먼저) ---
// 'public' 폴더의 내용을 최상위 경로처럼 사용합니다.
app.use(express.static('public'));

// --- 2. API 라우트 설정 ---
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);

// --- 3. HTML 페이지 라우팅 (명시적 정의) ---
// 각 페이지에 대한 경로를 직접 지정해줍니다.
const publicPath = path.join(__dirname, 'public');

app.get('/', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(publicPath, 'login.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(publicPath, 'signup.html')));
app.get('/home.html', (req, res) => res.sendFile(path.join(publicPath, 'home.html')));
app.get('/mode_select.html', (req, res) => res.sendFile(path.join(publicPath, 'mode_select.html')));
app.get('/game_classic.html', (req, res) => res.sendFile(path.join(publicPath, 'game_classic.html')));
app.get('/game_infinite.html', (req, res) => res.sendFile(path.join(publicPath, 'game_infinite.html')));
app.get('/game_result.html', (req, res) => res.sendFile(path.join(publicPath, 'game_result.html')));
// 필요한 다른 HTML 페이지들도 여기에 추가할 수 있습니다.


// --- 서버 실행 ---
app.listen(PORT, () => {
    console.log(`✅ 최종 수정 서버가 포트 ${PORT}에서 실행 중입니다.`);
});