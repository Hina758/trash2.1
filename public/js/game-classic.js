document.addEventListener('DOMContentLoaded', () => {
    const questionNumberEl = document.getElementById('question-number');
    const scoreEl = document.getElementById('score');
    const comboEl = document.getElementById('combo');
    const questionTextEl = document.getElementById('question-text');
    const answersArea = document.getElementById('answers-area');

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
    const CATEGORIES = [...new Set(TRASH_DATA.map(d => d.category))];

    let score = 0, currentCombo = 0, maxCombo = 0, currentQuestionIndex = 0;
    const totalQuestions = 10;
    let questions = [];
    let isAnswerable = true;

    const difficulty = sessionStorage.getItem('currentGameDifficulty') || 'easy';
    const SCORE_PER_ANSWER = { easy: 10, normal: 15, hard: 25 };
    const pointsPerCorrect = SCORE_PER_ANSWER[difficulty];

    function initGame() {
        questions = [...TRASH_DATA].sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
        displayNextQuestion();
    }

    function displayNextQuestion() {
        if (currentQuestionIndex >= totalQuestions) return endGame();
        
        isAnswerable = true;
        const currentQuestion = questions[currentQuestionIndex];
        questionNumberEl.textContent = `${currentQuestionIndex + 1} / ${totalQuestions}`;
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
            button.addEventListener('click', () => handleAnswer(option === correctAnswer, button, correctAnswer));
            answersArea.appendChild(button);
        });
    }

    function handleAnswer(isCorrect, button, correctAnswer) {
        if (!isAnswerable) return;
        isAnswerable = false;

        document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);

        if (isCorrect) {
            score += pointsPerCorrect * (1 + currentCombo * 0.1);
            currentCombo++;
            if (currentCombo > maxCombo) maxCombo = currentCombo;
            button.classList.add('correct');
        } else {
            currentCombo = 0;
            button.classList.add('wrong');
            document.querySelectorAll('.answer-btn').forEach(btn => {
                if (btn.textContent === correctAnswer) btn.classList.add('correct');
            });
        }
        scoreEl.textContent = Math.floor(score);
        comboEl.textContent = `x${currentCombo}`;
        setTimeout(() => { currentQuestionIndex++; displayNextQuestion(); }, 1200);
    }

    async function endGame() {
        questionTextEl.textContent = '게임 종료!';
        answersArea.innerHTML = '';
        sessionStorage.setItem('lastGameResult', JSON.stringify({ mode: '클래식', score: Math.floor(score), maxCombo }));

        const userData = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (userData) {
            await fetch(`${API_URL}/api/scores/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userData.username, mode: 'classic', score: Math.floor(score), combo: maxCombo })
            });
        }
        window.location.href = 'game_result.html';
    }
    initGame();
});