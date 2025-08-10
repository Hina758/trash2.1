const express = require('express');
const { readJSONFile, writeJSONFile } = require('../utils/fileHandler');
const router = express.Router();
const USERS_FILE = 'users.json';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '아이디와 비밀번호를 모두 입력해주세요.' });
        }

        const users = await readJSONFile(USERS_FILE);
        if (users.find(user => user.username === username)) {
            return res.status(409).json({ success: false, message: '이미 사용 중인 아이디입니다.' });
        }

        const newUser = {
            id: Date.now(),
            username,
            password, // In a real app, this should be hashed
            title: '신입',
            titleColor: 'linear-gradient(to right, #e0c3fc, #8ec5fc)',
            stats: { classicHighScore: 0, infiniteHighScore: 0, onlineWins: 0, maxCombo: 0 }
        };
        users.push(newUser);
        await writeJSONFile(USERS_FILE, users);
        res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '아이디와 비밀번호를 모두 입력해주세요.' });
        }

        const users = await readJSONFile(USERS_FILE);
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const { password: _, ...userToReturn } = user;
        res.status(200).json({ success: true, message: '로그인 성공!', user: userToReturn });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// Other server-side auth routes can go here...

module.exports = router;