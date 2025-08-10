const express = require('express');
const { readJSONFile, writeJSONFile } = require('../utils/fileHandler');
const router = express.Router();

const USERS_FILE = 'users.json';
const ONLINE_SCORES_FILE = 'scores_online.json';
const MATCH_QUEUE_FILE = 'match_queue.json';

router.post('/find', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ message: '사용자 정보가 필요합니다.' });

        let queue = await readJSONFile(MATCH_QUEUE_FILE);

        // 30초 이상 된 유저는 큐에서 제거
        queue = queue.filter(p => (Date.now() - p.timestamp) < 30000);

        if (queue.find(p => p.username === username)) {
            return res.json({ matched: false, message: '이미 대기열에 있습니다.' });
        }

        if (queue.length > 0) {
            const opponent = queue.shift();
            await writeJSONFile(MATCH_QUEUE_FILE, queue);
            res.json({ matched: true, opponent: opponent.username });
        } else {
            queue.push({ username, timestamp: Date.now() });
            await writeJSONFile(MATCH_QUEUE_FILE, queue);
            res.json({ matched: false, message: '대기열에 등록되었습니다.' });
        }
    } catch (error) {
        res.status(500).json({ message: '매칭 서버 오류' });
    }
});

router.post('/result', async (req, res) => {
    try {
        const { winner, loser } = req.body;
        if (!winner || !loser) return res.status(400).json({ success: false, message: '승자와 패자 정보가 필요합니다.' });

        const users = await readJSONFile(USERS_FILE);
        const winnerIndex = users.findIndex(u => u.username === winner);
        if (winnerIndex !== -1) {
            users[winnerIndex].stats.onlineWins = (users[winnerIndex].stats.onlineWins || 0) + 1;
            await writeJSONFile(USERS_FILE, users);
        }

        const onlineScores = users
            .filter(u => u.stats.onlineWins > 0)
            .map(u => ({
                username: u.username, title: u.title, titleColor: u.titleColor,
                score: u.stats.onlineWins, date: new Date().toISOString()
            }))
            .sort((a, b) => b.score - a.score).slice(0, 10);
        await writeJSONFile(ONLINE_SCORES_FILE, onlineScores);

        res.status(200).json({ success: true, message: '대전 결과가 기록되었습니다.' });
    } catch (error) {
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;