// theme.js
function setTheme(theme) {
    const body = document.body;
    const icons = document.querySelectorAll('.theme-toggle i');
    
    if (theme === 'light') {
        body.classList.add('light-mode');
        icons.forEach(icon => icon.classList.replace('fa-moon', 'fa-sun'));
    } else {
        body.classList.remove('light-mode');
        icons.forEach(icon => icon.classList.replace('fa-sun', 'fa-moon'));
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const newTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    setTheme(newTheme);
}

export { setTheme, toggleTheme };