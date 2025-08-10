const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 'public' 폴더를 정적 파일 제공 경로로 설정 (가장 중요)
app.use(express.static('public'));

// HTML 페이지를 위한 명시적 경로 설정
const publicPath = path.join(__dirname, 'public');
app.get('/', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(publicPath, 'login.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(publicPath, 'signup.html')));
app.get('/home.html', (req, res) => res.sendFile(path.join(publicPath, 'home.html')));
app.get('/mode_select.html', (req, res) => res.sendFile(path.join(publicPath, 'mode_select.html')));
app.get('/game_classic.html', (req, res) => res.sendFile(path.join(publicPath, 'game_classic.html')));
// 다른 HTML 파일들도 필요하다면 여기에 추가

// 서버 실행
app.listen(PORT, () => {
    console.log(`✅ 최종 수정 서버가 포트 ${PORT}에서 실행 중입니다.`);
});