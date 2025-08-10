document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (!userData) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const accountTitle = document.getElementById('account-title');
    const classicScoreEl = document.getElementById('classic-score');
    const infiniteScoreEl = document.getElementById('infinite-score');
    const onlineWinsEl = document.getElementById('online-wins');
    const maxComboEl = document.getElementById('max-combo');
    const titleInput = document.getElementById('title-input');
    const titleColorInput = document.getElementById('title-color-input');
    const titleUpdateForm = document.getElementById('title-update-form');
    const updateMessage = document.getElementById('update-message');

    // 사용자 정보 표시 함수
    function displayUserInfo(user) {
        accountTitle.textContent = `${user.username}님의 계정 정보`;
        classicScoreEl.textContent = user.stats.classicHighScore || 0;
        infiniteScoreEl.textContent = user.stats.infiniteHighScore || 0;
        onlineWinsEl.textContent = user.stats.onlineWins || 0;
        maxComboEl.textContent = user.stats.maxCombo || 0;
        titleInput.value = user.title;
        // titleColor는 그라데이션이므로, 첫 색상만 color picker에 표시
        const firstColor = user.titleColor.match(/#([0-9a-fA-F]{6})/g);
        if(firstColor) titleColorInput.value = firstColor[0];
    }

    // 초기 정보 표시
    displayUserInfo(userData);

    // 칭호 변경 폼 제출 이벤트
    titleUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTitle = titleInput.value;
        const newColor = titleColorInput.value;
        // 간단한 그라데이션 생성
        const newTitleColor = `linear-gradient(to right, ${newColor}, #ffffff)`;

        try {
            const response = await fetch('/api/auth/title', {
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
                // 로컬 사용자 정보도 업데이트
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