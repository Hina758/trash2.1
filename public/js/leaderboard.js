document.addEventListener('DOMContentLoaded', () => {
    const tabContainer = document.querySelector('.tab-container');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const scoreHeader = document.getElementById('score-header');

    const renderLeaderboard = (data, mode) => {
        leaderboardBody.innerHTML = '';
        if (data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="3">아직 기록이 없습니다.</td></tr>';
            return;
        }

        data.forEach((entry, index) => {
            const rank = index + 1;
            const row = document.createElement('tr');
            const nameCellContent = `
                <span class="username-cell" data-username="${entry.username}">
                    ${entry.username}
                    <span style="background: ${entry.titleColor}; padding: 1px 6px; margin-left: 5px; border-radius: 4px; color: #111; font-size: 0.8em;">
                        ${entry.title}
                    </span>
                </span>`;
            row.innerHTML = `
                <td class="rank-${rank}">${rank}</td>
                <td>${nameCellContent}</td>
                <td>${entry.score.toLocaleString()}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    };

    const fetchLeaderboard = async (mode) => {
        try {
            const response = await fetch(`${API_URL}/api/scores/${mode}`);
            const result = await response.json();
            if (response.ok) {
                scoreHeader.textContent = mode === 'online' ? '승리 횟수' : '점수';
                renderLeaderboard(result.leaderboard, mode);
            } else {
                leaderboardBody.innerHTML = `<tr><td colspan="3">${result.message}</td></tr>`;
            }
        } catch (error) {
            leaderboardBody.innerHTML = '<tr><td colspan="3">데이터를 불러오는 데 실패했습니다.</td></tr>';
        }
    };

    tabContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.tab-btn.active').classList.remove('active');
            e.target.classList.add('active');
            const mode = e.target.dataset.mode;
            fetchLeaderboard(mode);
        }
    });
    
    leaderboardBody.addEventListener('click', (e) => {
        const target = e.target.closest('.username-cell');
        if (target) {
            const username = target.dataset.username;
            alert(`${username}님의 정보 페이지는 현재 준비 중입니다.`);
        }
    });

    fetchLeaderboard('classic');
});