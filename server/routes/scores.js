const express = require('express');
const { readJSONFile, writeJSONFile } = require('../utils/fileHandler');
const router = express.Router();

const USERS_FILE = 'users.json';
const SCORE_FILES = {
    classic: 'scores_classic.json',
    infinite: 'scores_infinite.json',
    online: 'scores_online.json'
};

// --- 점수 제출 API ---
// POST /api/scores/submit
router.post('/submit', async (req, res) => {
    const { username, mode, score, combo } = req.body;

    // 필수 정보 확인
    if (!username || !mode || score === undefined) {
        return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
    }

    // 유효한 모드인지 확인
    const scoreFile = SCORE_FILES[mode];
    if (!scoreFile) {
        return res.status(400).json({ success: false, message: '알 수 없는 게임 모드입니다.' });
    }

    try {
        // 1. 순위표 업데이트
        const scores = await readJSONFile(scoreFile);
        const users = await readJSONFile(USERS_FILE);

        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        const newScoreEntry = {
            username: user.username,
            title: user.title,
            titleColor: user.titleColor,
            score: parseInt(score, 10),
            date: new Date().toISOString()
        };

        scores.push(newScoreEntry);
        // 점수 기준으로 내림차순 정렬
        scores.sort((a, b) => b.score - a.score);
        // 상위 10개만 저장
        const top10 = scores.slice(0, 10);
        await writeJSONFile(scoreFile, top10);

        // 2. 사용자 개인 최고 기록 및 통계 업데이트
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            const userToUpdate = users[userIndex];
            if (mode === 'classic' && userToUpdate.stats.classicHighScore < score) {
                userToUpdate.stats.classicHighScore = score;
            } else if (mode === 'infinite' && userToUpdate.stats.infiniteHighScore < score) {
                userToUpdate.stats.infiniteHighScore = score;
            }
            if (combo && userToUpdate.stats.maxCombo < combo) {
                userToUpdate.stats.maxCombo = combo;
            }
            // 온라인 승리 횟수는 match.js에서 별도 처리
            await writeJSONFile(USERS_FILE, users);
        }

        res.status(200).json({ success: true, message: '점수가 성공적으로 기록되었습니다.' });

    } catch (error) {
        console.error('점수 제출 처리 중 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// --- 순위표 조회 API ---
// GET /api/scores/:mode
router.get('/:mode', async (req, res) => {
    const { mode } = req.params;
    const scoreFile = SCORE_FILES[mode];

    if (!scoreFile) {
        return res.status(400).json({ success: false, message: '알 수 없는 게임 모드입니다.' });
    }

    try {
        const scores = await readJSONFile(scoreFile);
        res.status(200).json({ success: true, leaderboard: scores });
    } catch (error) {
        console.error('순위표 조회 중 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;