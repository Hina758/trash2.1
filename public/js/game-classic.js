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
    let score = 0, currentCombo = 0, maxCombo = 0, currentQuestionIndex = 0;
    const totalQuestions = 10;
    let isAnswerable = true;

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
                displayNextQuestion();
            }
        }, 1000);
    }

    function getCorrectAnswer(amount) {
        if (amount >= 80) return 100;
        return Math.ceil(amount / 10) * 10;
    }

    function displayNextQuestion() {
        if (currentQuestionIndex >= totalQuestions) return endGame();
        isAnswerable = true;
        questionNumberEl.textContent = `${currentQuestionIndex + 1} / ${totalQuestions}`;

        let question, correctAnswer;
        const isHidden = Math.random() < 0.15;
        if (isHidden) {
            question = "히든 쓰레기통";
            correctAnswer = 50;
        } else {
            const trashAmount = Math.floor(Math.random() * 99) + 1;
            question = `${trashAmount}L`;
            correctAnswer = getCorrectAnswer(trashAmount);
        }
        questionTextEl.textContent = question;

        answersArea.innerHTML = '';
        ANSWER_OPTIONS.forEach(option => {
            const button = document.createElement('button');
            button.textContent = `${option}L`;
            button.classList.add('answer-btn');
            button.addEventListener('click', () => handleAnswer(option === correctAnswer, button, isHidden));
            answersArea.appendChild(button);
        });
    }

    function handleAnswer(isCorrect, button, isHidden) {
        if (!isAnswerable) return;
        isAnswerable = false;
        document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);

        if (isCorrect) {
            let points = 100;
            if (isHidden) points *= 2;
            points += currentCombo * 10;
            score += points;
            currentCombo++;
            if (currentCombo > maxCombo) maxCombo = currentCombo;
            button.classList.add('correct');
        } else {
            currentCombo = 0;
            button.classList.add('wrong');
        }
        scoreEl.textContent = score;
        comboEl.textContent = `x${currentCombo}`;
        setTimeout(() => { currentQuestionIndex++; displayNextQuestion(); }, 1200);
    }

    async function endGame() {
        questionTextEl.textContent = '게임 종료!';
        answersArea.innerHTML = '';
        
        sessionStorage.setItem('lastGameResult', JSON.stringify({ mode: '클래식', score: score, maxCombo: maxCombo }));

        const userData = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (userData) {
            try {
                await fetch(`${API_URL}/api/scores/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: userData.username, mode: 'classic', score: score, combo: maxCombo })
                });
            } catch (error) {
                console.error("점수 저장 실패:", error);
            }
        }
        window.location.href = '/game_result.html';
    }

    startCountdown();
});