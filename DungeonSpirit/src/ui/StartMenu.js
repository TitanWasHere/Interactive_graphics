export class StartMenu {
    constructor(onStartGame, onExit) {
        this.onStartGame = onStartGame;
        this.onExit = onExit;
        this.isVisible = true;
        this.gameHasStarted = false; // Track if game has been started at least once
        
        this.createMenuHTML();
        this.setupEventListeners();
    }

    createMenuHTML() {
        // Create main menu container
        this.menuContainer = document.createElement('div');
        this.menuContainer.id = 'start-menu';
        this.menuContainer.className = 'start-menu-overlay';
        
        this.menuContainer.innerHTML = `
            <div class="menu-background">
                <div class="menu-content">
                    <h1 class="game-title">DUNGEON SPIRIT</h1>
                    <div class="menu-buttons">
                        <button id="start-game-btn" class="menu-btn">Start Game</button>
                        <button id="exit-btn" class="menu-btn">Exit</button>
                    </div>
                    <div class="menu-footer">
                        <p>Use WASD to move</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.menuContainer);
    }

    setupEventListeners() {
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.hide();
            this.gameHasStarted = true; // Mark that game has been started
            this.onStartGame();
        });

        document.getElementById('exit-btn').addEventListener('click', () => {
            this.onExit();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (this.isVisible) {
                    this.hide();
                    this.onStartGame();
                } else {
                    this.show();
                }
            }
        });
    }

    show() {
        this.menuContainer.style.display = 'flex';
        this.isVisible = true;
        
        // Update button text based on game state
        this.updateButtonText();
        
        document.body.style.cursor = 'default';
    }

    hide() {
        this.menuContainer.style.display = 'none';
        this.isVisible = false;
        
        document.body.style.cursor = 'none'; 
    }

    updateButtonText() {
        const startButton = document.getElementById('start-game-btn');
        if (startButton) {
            if (this.gameHasStarted) {
                startButton.textContent = 'Continue Game';
            } else {
                startButton.textContent = 'Start Game';
            }
        }
    }

    destroy() {
        if (this.menuContainer) {
            document.body.removeChild(this.menuContainer);
        }
    }
}
