// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { readJSON, writeJSON } = require('../utils/fileHandler');

const router = express.Router();
const USERS_FILE = 'users.json';

// Helper: remove sensitive fields
function safeUser(u) {
  return {
    username: u.username,
    displayName: u.displayName || u.username,
    title: u.title || '',
    titleGradient: u.titleGradient || '#00A8FF,#9C88FF',
    highScore: u.highScore || { classic: 0, infinite: 0, online: 0 },
    maxCombo: u.maxCombo || 0,
    onlineWins: u.onlineWins || 0,
    createdAt: u.createdAt || null
  };
}

// 회원가입
// body: { username, password, passwordConfirm, displayName }
router.post('/signup', async (req, res) => {
  try {
    const { username, password, passwordConfirm, displayName } = req.body;
    if (!username || !password || !passwordConfirm) {
      return res.status(400).json({ success: false, message: '필수 항목이 비어있습니다.' });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, message: '비밀번호 확인이 일치하지 않습니다.' });
    }

    const users = readJSON(USERS_FILE);
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, message: '이미 존재하는 아이디입니다.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      passwordHash: hash,
      displayName: displayName || username,
      title: '',
      titleGradient: '#00A8FF,#9C88FF',
      highScore: { classic: 0, infinite: 0, online: 0 },
      maxCombo: 0,
      onlineWins: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    return res.json({ success: true, message: '회원가입이 완료되었습니다.', user: safeUser(newUser) });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 로그인
// body: { username, password }
// returns public user info if success
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력하세요.' });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // 로그인 성공 — 비밀번호 해시 등 민감정보는 반환하지 않음
    return res.json({ success: true, message: '로그인 성공', user: safeUser(user) });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 공개 프로필 조회 (간단)
// GET /api/auth/me?username=alice
router.get('/me', (req, res) => {
  try {
    const username = req.query.username;
    if (!username) return res.status(400).json({ success: false, message: 'username 필요' });

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ success: false, message: '유저를 찾을 수 없습니다.' });

    return res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;
