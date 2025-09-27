class GameHub {
    constructor() {
        this.games = [];
        this.currentFilter = 'all';
        this.username = '';
        this.init();
    }

    async init() {
        try {
            this.initTheme();
            await this.handleUsername();
            await this.loadGames();
            this.renderGames();
            this.setupEventListeners();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize Game Hub:', error);
            this.showError();
        }
    }

    // Theme Management
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            this.updateThemeIcons(true);
        } else {
            this.updateThemeIcons(false);
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcons(isDark);
    }

    updateThemeIcons(isDark) {
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        
        if (isDark) {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    // Username Management
    async handleUsername() {
        const savedUsername = localStorage.getItem('username');
        
        if (savedUsername) {
            this.username = savedUsername;
            this.animateUsername(savedUsername);
        } else {
            this.showUsernameModal();
        }
    }

    showUsernameModal() {
        const modal = document.getElementById('username-modal');
        const input = document.getElementById('username-input');
        const saveBtn = document.getElementById('save-username');
        
        modal.classList.remove('hidden');
        input.focus();
        
        const handleSave = () => {
            const username = input.value.trim();
            if (username) {
                this.username = username;
                localStorage.setItem('username', username);
                modal.classList.add('hidden');
                this.animateUsername(username);
            }
        };
        
        saveBtn.addEventListener('click', handleSave);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSave();
            }
        });
    }

    animateUsername(username) {
        const display = document.getElementById('username-display');
        display.textContent = '';
        display.classList.add('typing-animation');
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < username.length) {
                display.textContent += username.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                display.classList.remove('typing-animation');
            }
        }, 100);
    }

    async loadGames() {
        try {
            const response = await fetch('./games/manifest.json');
            if (!response.ok) {
                throw new Error('Failed to fetch games manifest');
            }
            this.games = await response.json();
        } catch (error) {
            console.warn('Using mock data as fallback:', error);
            this.games = this.getMockGames();
        }
    }

    getMockGames() {
        return [
            {
                id: 'moto-x3m',
                title: 'Moto X3M Pool Party',
                description: 'Extreme motorcycle racing with pool party theme',
                tags: ['single-player', 'action', 'racing'],
                status: 'playable',
                path: '#',
                icon: '🏍️',
                iframe: '<iframe src="http://www.freeonlinegames.com/embed/145570" width="640" height="427" frameborder="no" scrolling="no"></iframe>'
            },
            {
                id: 'bubble-shooter',
                title: 'Bubble Shooter Extreme',
                description: 'Classic bubble shooting game with extreme challenges',
                tags: ['single-player', 'puzzle', 'casual'],
                status: 'playable',
                path: 'https://playground.kaballah.site/game/bubble-shooter',
                icon: '🫧',
                iframe: '<iframe src="http://www.freeonlinegames.com/embed/144939" width="900" height="675" frameborder="no" scrolling="no"></iframe>'
            },
            {
                id: 'battle-area',
                title: 'Battle Area HTML5',
                description: 'Intense multiplayer battle arena game',
                tags: ['multiplayer', 'action', 'strategy'],
                status: 'playable',
                path: 'https://playground.kaballah.site/game/battle-area',
                icon: '⚔️',
                iframe: '<iframe src="http://www.freeonlinegames.com/embed/160243" width="800" height="450" frameborder="no" scrolling="no"></iframe>'
            },
            {
                id: 'chess',
                title: 'Chess',
                description: 'Classic two-player strategy game',
                tags: ['multiplayer', 'turn-based', 'strategy'],
                status: 'in-development',
                path: '',
                icon: '♔'
            },
            {
                id: 'solitaire',
                title: 'Klondike Solitaire',
                description: 'The classic single-player card game',
                tags: ['single-player', 'cards'],
                status: 'in-development',
                path: '/games/solitaire/',
                icon: '🃏'
            },
            {
                id: 'poker',
                title: 'Texas Hold\'em',
                description: 'Multiplayer poker with real-time gameplay',
                tags: ['multiplayer', 'cards', 'real-time'],
                status: 'in-development',
                path: '/games/poker/',
                icon: '🂡'
            },
            {
                id: 'checkers',
                title: 'Checkers',
                description: 'Classic board game for two players',
                tags: ['multiplayer', 'turn-based', 'strategy'],
                status: 'in-development',
                path: '/games/checkers/',
                icon: '⚫'
            },
            {
                id: 'blackjack',
                title: 'Blackjack',
                description: 'Beat the dealer to 21',
                tags: ['single-player', 'cards'],
                status: 'in-development',
                path: '/games/blackjack/',
                icon: '🂫'
            }
        ];
    }

    renderGames() {
        const grid = document.getElementById('game-grid');
        const filteredGames = this.filterGames();

        if (filteredGames.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        grid.innerHTML = filteredGames.map(game => `
            <article class="game-tile rounded-lg shadow-sm border p-6 transition-all duration-200" 
                     data-game-id="${game.id}" data-tags="${game.tags.join(' ')}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                            ${game.icon || '🎮'}
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">${game.title}</h3>
                            <div class="flex items-center space-x-2 mt-1">
                                <div class="status-indicator rounded-full ${this.getStatusColor(game.status)}"
                                     title="${this.getStatusText(game.status)}"></div>
                                <span class="text-sm text-gray-500 dark:text-gray-400">${this.getStatusText(game.status)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${game.description}</p>

                <div class="flex flex-wrap gap-2 mb-4">
                    ${game.tags.map(tag => `
                        <span class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            ${this.formatTag(tag)}
                        </span>
                    `).join('')}
                </div>

                <button class="play-btn w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${this.getPlayButtonClass(game.status)}"
                        data-path="${game.path}" data-status="${game.status}" data-iframe="${game.iframe || ''}">
                    ${this.getPlayButtonText(game.status)}
                </button>
            </article>
        `).join('');

        this.attachPlayListeners();
    }

    filterGames() {
        if (this.currentFilter === 'all') {
            return this.games;
        }
        return this.games.filter(game => game.tags.includes(this.currentFilter));
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target);
                this.currentFilter = e.target.id.replace('filter-', '');
                this.renderGames();
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
        
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    setActiveFilter(activeButton) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    attachPlayListeners() {
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(btn => {
            if (btn.dataset.status === 'playable') {
                btn.addEventListener('click', (e) => {
                    const path = e.target.dataset.path;
                    const iframe = e.target.dataset.iframe;
                    this.launchGame(path, iframe);
                });
            }
        });
    }

    launchGame(path, iframe) {
        if (path && path.startsWith('https://playground.kaballah.site/')) {
            // Create a new window with the embedded game
            const newWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>Game - Kaballah's Playground</title>
                            <style>
                                body { 
                                    margin: 0; 
                                    padding: 20px; 
                                    font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                                    background: #f9fafb;
                                }
                                .game-container {
                                    max-width: 1000px;
                                    margin: 0 auto;
                                    background: white;
                                    border-radius: 12px;
                                    padding: 20px;
                                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                                }
                                .game-header {
                                    text-align: center;
                                    margin-bottom: 20px;
                                    padding-bottom: 15px;
                                    border-bottom: 1px solid #e5e7eb;
                                }
                                .game-frame {
                                    width: 100%;
                                    min-height: 500px;
                                    border: none;
                                    border-radius: 8px;
                                }
                                .back-btn {
                                    background: #3b82f6;
                                    color: white;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 14px;
                                    margin-bottom: 15px;
                                }
                                .back-btn:hover {
                                    background: #2563eb;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="game-container">
                                <button class="back-btn" onclick="window.close()">← Back to Playground</button>
                                <div class="game-header">
                                    <h1>Kaballah's Playground</h1>
                                </div>
                                <div class="game-content">
                                    ${iframe}
                                </div>
                            </div>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            }
        } else if (path) {
            // Fallback for other paths
            window.open(path, '_blank');
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'playable':
                return 'status-playable';
            case 'in-development':
                return 'status-in-development';
            default:
                return 'status-unavailable';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'playable':
                return 'Ready to Play';
            case 'in-development':
                return 'In Development';
            default:
                return 'Unavailable';
        }
    }

    getPlayButtonClass(status) {
        switch (status) {
            case 'playable':
                return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300';
            case 'in-development':
                return 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed';
            default:
                return 'bg-red-300 text-red-700 cursor-not-allowed';
        }
    }

    getPlayButtonText(status) {
        switch (status) {
            case 'playable':
                return 'Play';
            case 'in-development':
                return 'Coming Soon';
            default:
                return 'Unavailable';
        }
    }

    formatTag(tag) {
        return tag.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        loading.style.display = 'none';
    }

    showError() {
        const loading = document.getElementById('loading');
        loading.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-600 dark:text-red-400 text-lg">Failed to load games. Please try again.</p>
            </div>
        `;
    }

    showEmptyState() {
        document.getElementById('empty-state').classList.remove('hidden');
        document.getElementById('game-grid').innerHTML = '';
    }

    hideEmptyState() {
        document.getElementById('empty-state').classList.add('hidden');
    }
}

// Initialize the game hub when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameHub();
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        return; // Let default tab behavior work
    }
    
    // Escape key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('username-modal');
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    }
    
    // Add arrow key navigation for game grid
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('play-btn')) {
            e.preventDefault();
            // Implement arrow key navigation logic here if needed
        }
    }
});