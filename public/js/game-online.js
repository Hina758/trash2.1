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
    let myCorrectAnswers = 0;
    let opponentCorrectAnswers = 0;
    let timerInterval;
    let timeElapsed = 0;
    let isAnswerable = true;
    let matchCheckInterval;

    async function findMatch() {
        try {
            const response = await fetch(`${API_URL}/api/match/find`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userData.username })
            });
            const result = await response.json();

            if (result.matched) {
                clearInterval(matchCheckInterval);
                opponent = result.opponent;
                startGame();
            }
        } catch (error) {
            console.error('매칭 오류:', error);
        }
    }

    function startGame() {
        matchingOverlay.style.display = 'none';
        gameContainer.style.visibility = 'visible';
        opponentNameEl.textContent = `상대: ${opponent}`;
        
        questions = TRASH_DATA.sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
        
        timerInterval = setInterval(() => {
            timeElapsed += 0.1;
            timerEl.textContent = timeElapsed.toFixed(1);
        }, 100);

        displayNextQuestion();
        simulateOpponent();
    }

    function displayNextQuestion() {
        if (currentQuestionIndex >= totalQuestions) {
            return endGame(true);
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
            myCorrectAnswers++;
            button.classList.add('correct');
        } else {
            button.classList.add('wrong');
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            displayNextQuestion();
        }, 500);
    }

    function simulateOpponent() {
        const opponentInterval = setInterval(() => {
            if (opponentCorrectAnswers < totalQuestions) {
                opponentCorrectAnswers++;
                const progress = (opponentCorrectAnswers / totalQuestions) * 100;
                opponentBar.style.width = `${progress}%`;
                opponentBar.textContent = `${opponentCorrectAnswers}/10`;
            } else {
                clearInterval(opponentInterval);
                if (currentQuestionIndex < totalQuestions) {
                    endGame(false);
                }
            }
        }, Math.random() * 2000 + 1000);
    }

    async function endGame(iFinishedFirst) {
        if (timerInterval) clearInterval(timerInterval);
        if (matchCheckInterval) clearInterval(matchCheckInterval);
        isAnswerable = false;
        
        // 내가 이겼는지 판정 (맞춘 개수가 많거나, 같으면 시간이 짧은 쪽)
        // 여기서는 간단하게 먼저 끝낸 사람이 이기는 것으로 처리
        const iWon = iFinishedFirst; 
        
        let resultMessage = '';
        if (iWon) {
            resultMessage = '승리했습니다!';
            await fetch(`${API_URL}/api/match/result`, {
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
    
    // 3초마다 매칭 요청 시작
    matchCheckInterval = setInterval(findMatch, 3000);
    findMatch(); // 즉시 1회 실행
});