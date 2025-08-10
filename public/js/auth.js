document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const messageArea = document.getElementById('message-area');

    // --- 메시지 표시 함수 ---
    const showMessage = (message, isSuccess) => {
        messageArea.textContent = message;
        messageArea.className = 'message'; // 클래스 초기화
        messageArea.classList.add(isSuccess ? 'success' : 'error');
        messageArea.style.display = 'block';
    };

    // --- 회원가입 폼 처리 ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 폼 기본 제출 동작 방지

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;

            if (password !== passwordConfirm) {
                showMessage('비밀번호가 일치하지 않습니다.', false);
                return;
            }

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(result.message, true);
                    signupForm.style.display = 'none'; // 성공 시 폼 숨기기
                    document.getElementById('home-button-container').classList.remove('hidden');
                } else {
                    showMessage(result.message, false);
                }
            } catch (error) {
                showMessage('네트워크 오류가 발생했습니다.', false);
            }
        });
    }

    // --- 로그인 폼 처리 ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (result.success) {
                    // 로그인 성공 시 사용자 정보를 sessionStorage에 저장
                    sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                    // 홈 화면으로 이동
                    window.location.href = 'home.html';
                } else {
                    showMessage(result.message, false);
                }
            } catch (error) {
                showMessage('네트워크 오류가 발생했습니다.', false);
            }
        });
    }
});