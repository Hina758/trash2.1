const express = require('express');
const { readJSONFile, writeJSONFile } = require('../utils/fileHandler');
const router = express.Router();

const USERS_FILE = 'users.json';
const ONLINE_SCORES_FILE = 'scores_online.json';

// 임시 매칭 큐
let waitingPlayer = null;

// --- 매칭 찾기 API ---
// POST /api/match/find
router.post('/find', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: '사용자 정보가 필요합니다.' });
    }

    if (waitingPlayer && waitingPlayer.username !== username) {
        // 매칭 성공
        const player1 = waitingPlayer;
        const player2 = { username };
        waitingPlayer = null; // 큐 비우기

        // 두 플레이어에게 동일한 게임 ID와 상대 정보 반환
        const gameId = `online_match_${Date.now()}`;
        res.json({ matched: true, opponent: player1.username, gameId });
        
        // 대기 중이던 플레이어에게도 응답을 보내야 하지만,
        // HTTP 특성상 어려우므로 클라이언트에서 주기적으로 확인(폴링)하는 방식이 필요.
        // 여기서는 간단한 시뮬레이션으로, 실제로는 웹소켓이 적합.

    } else {
        // 대기 큐에 추가
        waitingPlayer = { username, res }; // 응답 객체를 저장하여 나중에 응답
        // 타임아웃 로직 추가 필요
        // setTimeout(() => {
        //     if (waitingPlayer && waitingPlayer.username === username) {
        //         waitingPlayer = null;
        //         res.json({ matched: false, message: '상대를 찾지 못했습니다.' });
        //     }
        // }, 30000); // 30초 대기
        res.json({ matched: false, message: '상대를 찾는 중입니다...' });
    }
});


// --- 온라인 대전 결과 제출 API ---
// POST /api/match/result
router.post('/result', async (req, res) => {
    // 온라인 대전에서는 '승리'가 점수 역할을 함
    const { winner, loser } = req.body;

    if (!winner || !loser) {
        return res.status(400).json({ success: false, message: '승자와 패자 정보가 필요합니다.' });
    }

    try {
        const users = await readJSONFile(USERS_FILE);
        const winnerIndex = users.findIndex(u => u.username === winner);

        // 승자 승리 횟수 증가
        if (winnerIndex !== -1) {
            users[winnerIndex].stats.onlineWins = (users[winnerIndex].stats.onlineWins || 0) + 1;
            await writeJSONFile(USERS_FILE, users);
        }

        // 온라인 순위표는 승리 횟수 기준으로 업데이트
        const onlineScores = users
            .filter(u => u.stats.onlineWins > 0)
            .map(u => ({
                username: u.username,
                title: u.title,
                titleColor: u.titleColor,
                score: u.stats.onlineWins, // 점수 대신 승리 횟수
                date: new Date().toISOString()
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        await writeJSONFile(ONLINE_SCORES_FILE, onlineScores);

        res.status(200).json({ success: true, message: '대전 결과가 기록되었습니다.' });

    } catch (error) {
        console.error('대전 결과 처리 중 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});


module.exports = router;