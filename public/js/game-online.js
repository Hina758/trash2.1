document.addEventListener('DOMContentLoaded', () => {
    const matchingOverlay = document.getElementById('matching-overlay');
    const gameContainer = document.querySelector('.game-container');
    const opponentNameEl = document.getElementById('opponent-name');
    const opponentBar = document.getElementById('opponent-bar');
    const myProgressEl = document.getElementById('my-progress');
    const timerEl = document.getElementById('timer');
    const questionTextEl = document.getElementById('question-text');
    const answersArea = document.getElementById('answers-area');

    const userData = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!userData) {
        alert('온라인 대전은 로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    // --- 게임 데이터 (다른 모드와 동일) ---
    const TRASH_DATA = [
        { item: '페트병', category: '플라스틱' }, { item: '과자 봉지', category: '비닐' },
        { item: '깨진 유리컵', category: '일반쓰레기' }, { item: '콜라 캔', category: '캔류' },
        { item: '신문지', category: '종이' }, { item: '형광등', category: '형광등 전용수거함' },
        { item: '오염된 휴지', category: '일반쓰레기' }, { item: '우유팩', category: '종이' },
        { item: '플라스틱 컵', category: '플라스틱' }, { item: '스티로폼', category: '스티로폼' },
        { item: '음식물 뼈', category: '일반쓰레기' }, { item: '맥주병', category: '병류' },
        { item: '다 쓴 건전지', category: '건전지 전용수거함' }, { item: '종이컵', category: '종이' },
        { item: '알루미늄 호일', category: '일반쓰레기' }, { item: '과일 껍질', category: '음식물쓰레기' },
    ];
    const CATEGORIES = ['플라스틱', '비닐', '일반쓰레기', '캔류', '종이', '병류', '스티로폼', '형광등 전용수거함', '건전지 전용수거함', '음식물쓰레기'];
    
    let opponent = null;
    let questions = [];
    let currentQuestionIndex = 0;
    const totalQuestions = 10;
    let myScore = 0;
    let opponentScore = 0; // 시뮬레이션용
    let timerInterval;
    let timeElapsed = 0;
    let isAnswerable = true;

    // --- 매칭 찾기 ---
    async function findMatch() {
        try {
            const response = await fetch('/api/match/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userData.username })
            });
            const result = await response.json();

            if (result.matched) {
                opponent = result.opponent;
                startGame();
            } else {
                // 3초마다 다시 확인
                setTimeout(findMatch, 3000);
            }
        } catch (error) {
            console.error('매칭 오류:', error);
            // 에러 발생 시 5초 후 재시도
            setTimeout(findMatch, 5000);
        }
    }

    // --- 게임 시작 ---
    function startGame() {
        matchingOverlay.style.display = 'none';
        gameContainer.style.visibility = 'visible';
        opponentNameEl.textContent = `상대: ${opponent}`;
        
        // 고정된 문제 세트 (실제로는 서버에서 받아야 함)
        questions = TRASH_DATA.sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
        
        timerInterval = setInterval(() => {
            timeElapsed += 0.1;
            timerEl.textContent = timeElapsed.toFixed(1);
        }, 100);

        displayNextQuestion();
        simulateOpponent(); // 상대방 플레이 시뮬레이션
    }

    function displayNextQuestion() {
        if (currentQuestionIndex >= totalQuestions) {
            endGame(true); // 내가 먼저 끝냄
            return;
        }
        isAnswerable = true;
        const currentQuestion = questions[currentQuestionIndex];
        myProgressEl.textContent = `${currentQuestionIndex} / ${totalQuestions}`;
        questionTextEl.textContent = currentQuestion.item;

        const correctAnswer = currentQuestion.category;
        let options = [correctAnswer];
        while (options.length < 4) {
            const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            if (!options.includes(randomCategory)) options.push(randomCategory);
        }
        options.sort(() => 0.5 - Math.random());

        answersArea.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('answer-btn');
            button.addEventListener('click', () => handleAnswer(option === correctAnswer, button));
            answersArea.appendChild(button);
        });
    }

    function handleAnswer(isCorrect, button) {
        if (!isAnswerable) return;
        isAnswerable = false;

        if (isCorrect) {
            myScore++;
            button.classList.add('correct');
        } else {
            button.classList.add('wrong');
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            displayNextQuestion();
        }, 500);
    }

    // --- 상대방 시뮬레이션 ---
    function simulateOpponent() {
        const opponentInterval = setInterval(() => {
            if (opponentScore < totalQuestions) {
                opponentScore++;
                const progress = (opponentScore / totalQuestions) * 100;
                opponentBar.style.width = `${progress}%`;
                opponentBar.textContent = `${opponentScore}/10`;
            } else {
                clearInterval(opponentInterval);
                if (currentQuestionIndex < totalQuestions) {
                    endGame(false); // 상대가 먼저 끝냄
                }
            }
        }, Math.random() * 2000 + 1000); // 1~3초마다 한 문제씩 푸는 것처럼
    }

    async function endGame(iWon) {
        clearInterval(timerInterval);
        isAnswerable = false;
        
        let resultMessage = '';
        if (iWon) {
            resultMessage = '승리했습니다!';
            await fetch('/api/match/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winner: userData.username, loser: opponent })
            });
        } else {
            resultMessage = '패배했습니다...';
        }
        
        sessionStorage.setItem('lastGameResult', JSON.stringify({
            mode: '온라인 대전',
            score: resultMessage,
            opponent
        }));
        
        window.location.href = 'game_result.html';
    }

    findMatch();
});