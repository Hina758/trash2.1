document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 가져오기 ---
    const questionNumberEl = document.getElementById('question-number');
    const scoreEl = document.getElementById('score');
    const comboEl = document.getElementById('combo');
    const questionTextEl = document.getElementById('question-text');
    const answersArea = document.getElementById('answers-area');

    // --- 게임 데이터 ---
    const TRASH_DATA = [
        { item: '페트병', category: '플라스틱' },
        { item: '과자 봉지', category: '비닐' },
        { item: '깨진 유리컵', category: '일반쓰레기' },
        { item: '콜라 캔', category: '캔류' },
        { item: '신문지', category: '종이' },
        { item: '형광등', category: '형광등 전용수거함' },
        { item: '오염된 휴지', category: '일반쓰레기' },
        { item: '우유팩', category: '종이' },
        { item: '플라스틱 컵', category: '플라스틱' },
        { item: '스티로폼', category: '스티로폼' },
        { item: '음식물 뼈', category: '일반쓰레기' },
        { item: '맥주병', category: '병류' },
        { item: '다 쓴 건전지', category: '건전지 전용수거함' },
        { item: '종이컵', category: '종이' },
        { item: '알루미늄 호일', category: '일반쓰레기' },
        { item: '과일 껍질', category: '음식물쓰레기' },
    ];
    const CATEGORIES = ['플라스틱', '비닐', '일반쓰레기', '캔류', '종이', '병류', '스티로폼', '형광등 전용수거함', '건전지 전용수거함', '음식물쓰레기'];

    // --- 게임 상태 변수 ---
    let score = 0;
    let currentCombo = 0;
    let maxCombo = 0;
    let currentQuestionIndex = 0;
    const totalQuestions = 10;
    let questions = [];
    let isAnswerable = true;

    // --- 난이도별 설정 ---
    const difficulty = sessionStorage.getItem('currentGameDifficulty') || 'easy';
    const SCORE_PER_ANSWER = { easy: 10, normal: 15, hard: 25 };
    const pointsPerCorrect = SCORE_PER_ANSWER[difficulty];

    // --- 게임 초기화 및 시작 ---
    function initGame() {
        // 문제 랜덤으로 섞고 10개 선택
        questions = TRASH_DATA.sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
        displayNextQuestion();
    }

    // --- 문제 표시 ---
    function displayNextQuestion() {
        if (currentQuestionIndex >= totalQuestions) {
            endGame();
            return;
        }
        isAnswerable = true;
        const currentQuestion = questions[currentQuestionIndex];
        
        // HUD 업데이트
        questionNumberEl.textContent = `${currentQuestionIndex + 1} / ${totalQuestions}`;
        questionTextEl.textContent = currentQuestion.item;

        // 정답 및 오답 선택지 생성
        const correctAnswer = currentQuestion.category;
        let options = [correctAnswer];
        while (options.length < 4) {
            const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            if (!options.includes(randomCategory)) {
                options.push(randomCategory);
            }
        }
        options.sort(() => 0.5 - Math.random()); // 선택지 섞기

        // 버튼 생성
        answersArea.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('answer-btn');
            button.addEventListener('click', () => handleAnswer(option, correctAnswer, button));
            answersArea.appendChild(button);
        });
    }

    // --- 정답 처리 ---
    function handleAnswer(selectedOption, correctOption, button) {
        if (!isAnswerable) return;
        isAnswerable = false;

        const allButtons = answersArea.querySelectorAll('.answer-btn');
        allButtons.forEach(btn => btn.disabled = true);

        if (selectedOption === correctOption) {
            // 정답
            score += pointsPerCorrect * (1 + currentCombo * 0.1); // 콤보 보너스
            currentCombo++;
            if (currentCombo > maxCombo) maxCombo = currentCombo;
            button.classList.add('correct');
        } else {
            // 오답
            currentCombo = 0;
            button.classList.add('wrong');
            // 정답 버튼도 표시
            allButtons.forEach(btn => {
                if (btn.textContent === correctOption) {
                    btn.classList.add('correct');
                }
            });
        }

        // 점수 및 콤보 업데이트
        scoreEl.textContent = Math.floor(score);
        comboEl.textContent = `x${currentCombo}`;

        // 1초 후 다음 문제로
        setTimeout(() => {
            currentQuestionIndex++;
            displayNextQuestion();
        }, 1000);
    }

    // --- 게임 종료 ---
    async function endGame() {
        questionTextEl.textContent = '게임 종료!';
        answersArea.innerHTML = '';
        
        // 결과 sessionStorage에 저장
        sessionStorage.setItem('lastGameResult', JSON.stringify({
            mode: '클래식',
            score: Math.floor(score),
            maxCombo
        }));

        // 로그인 유저면 점수 제출
        const userData = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (userData) {
            await fetch('/api/scores/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userData.username,
                    mode: 'classic',
                    score: Math.floor(score),
                    combo: maxCombo
                })
            });
        }

        // 결과 페이지로 이동
        window.location.href = 'game_result.html';
    }

    // 게임 시작
    initGame();
});