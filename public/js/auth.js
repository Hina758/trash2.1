document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const messageArea = document.getElementById('message-area');

    const showMessage = (message, isSuccess) => {
        messageArea.textContent = message;
        messageArea.className = 'message';
        messageArea.classList.add(isSuccess ? 'success' : 'error');
        messageArea.style.display = 'block';
    };

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;

            if (password !== passwordConfirm) {
                return showMessage('비밀번호가 일치하지 않습니다.', false);
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                if (result.success) {
                    showMessage(result.message, true);
                    signupForm.style.display = 'none';
                    document.getElementById('home-button-container').classList.remove('hidden');
                } else {
                    showMessage(result.message, false);
                }
            } catch (error) {
                console.error('Signup Error:', error);
                showMessage('네트워크 오류가 발생했습니다.', false);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                if (result.success) {
                    sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                    window.location.href = 'home.html';
                } else {
                    showMessage(result.message, false);
                }
            } catch (error) {
                console.error('Login Error:', error);
                showMessage('네트워크 오류가 발생했습니다.', false);
            }
        });
    }
});