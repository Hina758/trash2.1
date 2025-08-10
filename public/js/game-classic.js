document.addEventListener('DOMContentLoaded', () => {
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownText = document.getElementById('countdown-text');
    const gameContainer = document.querySelector('.game-container');
    
    const questionNumberEl = document.getElementById('question-number');
    const scoreEl = document.getElementById('score');
    const comboEl = document.getElementById('combo');
    const questionTextEl = document.getElementById('question-text');
    const answersArea = document.getElementById('answers-area');

    const ANSWER_OPTIONS = [10, 20, 50, 100];
    let score = 0, currentCombo = 0, currentQuestionIndex = 0;
    const totalQuestions = 10;
    let isAnswerable = true;

    // 카운트다운 함수
    function startCountdown() {
        let count = 3;
        countdownText.textContent = count;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.textContent = count;
            } else if (count === 0) {
                countdownText.textContent = 'START!';
            } else {
                clearInterval(interval);
                countdownOverlay.style.display = 'none';
                gameContainer.style.visibility = 'visible';
                initGame();
            }
        }, 1000);
    }

    // 게임 초기화
    function initGame() {
        displayNextQuestion();
    }

    // 문제 생성 및 표시
    function displayNextQuestion() {
        if (currentQuestionIndex >= totalQuestions) return endGame();
        
        isAnswerable = true;
        questionNumberEl.textContent = `${currentQuestionIndex + 1} / ${totalQuestions}`;

        // 문제 생성 (90% 확률로 숫자, 10% 확률로 히든)
        let question, correctAnswer;
        if (Math.random() < 0.1) {
            question = "히든 쓰레기통";
            correctAnswer = 50;
        } else {
            const trashAmount = Math.floor(Math.random() * 99) + 1;
            question = `${trashAmount}L`;
            if (trashAmount >= 80) correctAnswer = 100;
            else correctAnswer = Math.ceil(trashAmount / 10) * 10;
        }
        questionTextEl.textContent = question;
        
        answersArea.innerHTML = '';
        ANSWER_OPTIONS.forEach(option => {
            const button = document.createElement('button');
            button.textContent = `${option}L`;
            button.classList.add('answer-btn');
            button.dataset.answer = option;
            button.addEventListener('click', () => handleAnswer(option === correctAnswer, button, question === "히든 쓰레기통"));
            answersArea.appendChild(button);
        });
    }

    // 정답 처리
    function handleAnswer(isCorrect, button, isHidden) {
        if (!isAnswerable) return;
        isAnswerable = false;
        document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);

        if (isCorrect) {
            let points = 100; // 기본 점수
            if (isHidden) points *= 2; // 히든 점수 2배
            points += currentCombo * 10; // 콤보 보너스
            score += points;

            currentCombo++;
            button.classList.add('correct');
        } else {
            currentCombo = 0;
            button.classList.add('wrong');
        }
        scoreEl.textContent = score;
        comboEl.textContent = `x${currentCombo}`;
        setTimeout(() => { currentQuestionIndex++; displayNextQuestion(); }, 1000);
    }

    // 게임 종료
    function endGame() {
        alert(`게임 종료!\n최종 점수: ${score}점`);
        window.location.href = 'mode_select.html';
    }

    startCountdown();
});