document.addEventListener('DOMContentLoaded', () => {
    const userJson = sessionStorage.getItem('loggedInUser');
    if (!userJson) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    const userData = JSON.parse(userJson);

    const accountTitle = document.getElementById('account-title');
    const classicScoreEl = document.getElementById('classic-score');
    const infiniteScoreEl = document.getElementById('infinite-score');
    const onlineWinsEl = document.getElementById('online-wins');
    const maxComboEl = document.getElementById('max-combo');
    const titleInput = document.getElementById('title-input');
    const titleColorInput = document.getElementById('title-color-input');
    const titleUpdateForm = document.getElementById('title-update-form');
    const updateMessage = document.getElementById('update-message');

    function displayUserInfo(user) {
        accountTitle.textContent = `${user.username}님의 계정 정보`;
        classicScoreEl.textContent = user.stats.classicHighScore || 0;
        infiniteScoreEl.textContent = user.stats.infiniteHighScore || 0;
        onlineWinsEl.textContent = user.stats.onlineWins || 0;
        maxComboEl.textContent = user.stats.maxCombo || 0;
        titleInput.value = user.title;
        const firstColor = user.titleColor.match(/#([0-9a-fA-F]{6})/g);
        if (firstColor) titleColorInput.value = firstColor[0];
    }

    displayUserInfo(userData);

    titleUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTitle = titleInput.value;
        const newColor = titleColorInput.value;
        const newTitleColor = `linear-gradient(to right, ${newColor}, #ffffff)`;

        try {
            const response = await fetch(`${API_URL}/api/auth/title`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userData.username,
                    title: newTitle,
                    titleColor: newTitleColor
                })
            });
            const result = await response.json();
            if (result.success) {
                updateMessage.textContent = '칭호가 성공적으로 변경되었습니다!';
                updateMessage.style.color = 'lightgreen';
                userData.title = newTitle;
                userData.titleColor = newTitleColor;
                sessionStorage.setItem('loggedInUser', JSON.stringify(userData));
            } else {
                updateMessage.textContent = result.message;
                updateMessage.style.color = 'tomato';
            }
        } catch (error) {
            updateMessage.textContent = '오류가 발생했습니다.';
            updateMessage.style.color = 'tomato';
        }
    });
});