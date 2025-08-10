const express = require('express');
const { readJSONFile, writeJSONFile } = require('../utils/fileHandler');
const router = express.Router();

const USERS_FILE = 'users.json';
const SCORE_FILES = {
    classic: 'scores_classic.json',
    infinite: 'scores_infinite.json',
    online: 'scores_online.json'
};

router.post('/submit', async (req, res) => {
    try {
        const { username, mode, score, combo } = req.body;
        if (!username || !mode || score === undefined) return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });

        const scoreFile = SCORE_FILES[mode];
        if (!scoreFile) return res.status(400).json({ success: false, message: '알 수 없는 게임 모드입니다.' });

        const users = await readJSONFile(USERS_FILE);
        const user = users.find(u => u.username === username);
        if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

        const scores = await readJSONFile(scoreFile);
        const newScoreEntry = {
            username: user.username, title: user.title, titleColor: user.titleColor,
            score: parseInt(score, 10), date: new Date().toISOString()
        };
        scores.push(newScoreEntry);
        scores.sort((a, b) => b.score - a.score);
        const top10 = scores.slice(0, 10);
        await writeJSONFile(scoreFile, top10);

        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            if (mode === 'classic' && users[userIndex].stats.classicHighScore < score) users[userIndex].stats.classicHighScore = score;
            else if (mode === 'infinite' && users[userIndex].stats.infiniteHighScore < score) users[userIndex].stats.infiniteHighScore = score;
            if (combo && users[userIndex].stats.maxCombo < combo) users[userIndex].stats.maxCombo = combo;
            await writeJSONFile(USERS_FILE, users);
        }
        res.status(200).json({ success: true, message: '점수가 성공적으로 기록되었습니다.' });
    } catch (error) {
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

router.get('/:mode', async (req, res) => {
    try {
        const { mode } = req.params;
        const scoreFile = SCORE_FILES[mode];
        if (!scoreFile) return res.status(400).json({ success: false, message: '알 수 없는 게임 모드입니다.' });
        const scores = await readJSONFile(scoreFile);
        res.status(200).json({ success: true, leaderboard: scores });
    } catch (error) {
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;