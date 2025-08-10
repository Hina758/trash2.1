document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        window.location.href = 'home.html';
        return;
    }

    setTimeout(() => {
        if (splashScreen) splashScreen.style.display = 'none';
        if (mainContent) {
            mainContent.classList.remove('hidden');
            mainContent.style.display = 'block';
        }
    }, 3500);
});