document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');

    // 이미 로그인한 사용자인지 확인
    // sessionStorage에 'loggedInUser' 정보가 있으면 홈으로 바로 이동
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        // 이미 로그인 상태면 스플래시 화면 없이 바로 홈으로 이동
        window.location.href = 'home.html';
        return;
    }

    // 3.5초 후에 스플래시 화면을 완전히 숨기고 메인 콘텐츠를 표시
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        mainContent.style.display = 'block';
    }, 3500);
});