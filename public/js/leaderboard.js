document.addEventListener('DOMContentLoaded', () => {
    const tabContainer = document.querySelector('.tab-container');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const scoreHeader = document.getElementById('score-header');

    // 순위표를 그리는 함수
    const renderLeaderboard = (data, mode) => {
        leaderboardBody.innerHTML = ''; // 기존 내용 초기화
        
        if (data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="3">아직 기록이 없습니다.</td></tr>';
            return;
        }

        data.forEach((entry, index) => {
            const rank = index + 1;
            const row = document.createElement('tr');
            
            // 이름과 칭호를 함께 표시
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

    // 특정 모드의 순위표 데이터를 불러오는 함수
    const fetchLeaderboard = async (mode) => {
        try {
            const response = await fetch(`/api/scores/${mode}`);
            const result = await response.json();

            if (result.success) {
                // 온라인 모드는 '점수' 헤더를 '승리'로 변경
                scoreHeader.textContent = mode === 'online' ? '승리 횟수' : '점수';
                renderLeaderboard(result.leaderboard, mode);
            } else {
                leaderboardBody.innerHTML = `<tr><td colspan="3">${result.message}</td></tr>`;
            }
        } catch (error) {
            leaderboardBody.innerHTML = '<tr><td colspan="3">데이터를 불러오는 데 실패했습니다.</td></tr>';
        }
    };

    // 탭 클릭 이벤트 처리
    tabContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.tab-btn.active').classList.remove('active');
            e.target.classList.add('active');
            const mode = e.target.dataset.mode;
            fetchLeaderboard(mode);
        }
    });
    
    // 다른 유저 이름 클릭 시 해당 유저 정보 페이지로 (미구현)
    leaderboardBody.addEventListener('click', (e) => {
        const target = e.target.closest('.username-cell');
        if (target) {
            const username = target.dataset.username;
            // TODO: 다른 유저 정보 조회 페이지로 이동하는 기능
            alert(`${username}님의 정보 페이지는 현재 준비 중입니다.`);
        }
    });

    // 초기 로드 시 클래식 모드 순위표 표시
    fetchLeaderboard('classic');
});