const toggleBtn = document.getElementById('themeToggle');
        const body = document.body;
    
        // Function to apply the theme
        function applyTheme(theme) {
            body.className = theme;
            localStorage.setItem('theme', theme);
            toggleBtn.innerHTML = theme === 'dark-theme' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    
        // Event listener for the toggle button
        toggleBtn.addEventListener('click', function() {
            const currentTheme = localStorage.getItem('theme');
            if(currentTheme === 'dark-theme') {
                applyTheme('');
            } else {
                applyTheme('dark-theme');
            }
        });
    
        // Apply saved theme on page load
        document.addEventListener('DOMContentLoaded', (event) => {
            const savedTheme = localStorage.getItem('theme') || '';
            applyTheme(savedTheme);
        });