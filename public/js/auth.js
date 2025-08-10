const express = require('express');
const { readJSONFile, writeJSONFile } = require('../utils/fileHandler');
const router = express.Router();
const USERS_FILE = 'users.json';

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: '아이디와 비밀번호를 모두 입력해주세요.' });

        const users = await readJSONFile(USERS_FILE);
        if (users.find(user => user.username === username)) {
            return res.status(409).json({ success: false, message: '이미 사용 중인 아이디입니다.' });
        }

        const newUser = {
            id: Date.now(), username, password, title: '신입',
            titleColor: 'linear-gradient(to right, #e0c3fc, #8ec5fc)',
            stats: { classicHighScore: 0, infiniteHighScore: 0, onlineWins: 0, maxCombo: 0 }
        };
        users.push(newUser);
        await writeJSONFile(USERS_FILE, users);
        res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: '아이디와 비밀번호를 모두 입력해주세요.' });

        const users = await readJSONFile(USERS_FILE);
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });

        const { password: _, ...userToReturn } = user;
        res.status(200).json({ success: true, message: '로그인 성공!', user: userToReturn });
    } catch (error) {
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

router.get('/account/:username', async (req, res) => {
    try {
        const users = await readJSONFile(USERS_FILE);
        const user = users.find(u => u.username === req.params.username);
        if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        const { password: _, ...userToReturn } = user;
        res.status(200).json({ success: true, user: userToReturn });
    } catch (error) {
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.post('/title', async (req, res) => {
    try {
        const { username, title, titleColor } = req.body;
        if (!username || !title || !titleColor) return res.status(400).json({ success: false, message: '모든 정보를 입력해주세요.' });

        const users = await readJSONFile(USERS_FILE);
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

        users[userIndex].title = title;
        users[userIndex].titleColor = titleColor;
        await writeJSONFile(USERS_FILE, users);
        res.status(200).json({ success: true, message: '칭호가 업데이트되었습니다.' });
    } catch (error) {
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;