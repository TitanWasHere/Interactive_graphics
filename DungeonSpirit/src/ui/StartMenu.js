export class StartMenu {
    constructor(onStartGame, onSettings, onExit) {
        this.onStartGame = onStartGame;
        this.onSettings = onSettings;
        this.onExit = onExit;
        this.isVisible = true;
        
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
        
        document.body.style.cursor = 'default';
    }

    hide() {
        this.menuContainer.style.display = 'none';
        this.isVisible = false;
        
        document.body.style.cursor = 'none'; 
    }

    destroy() {
        if (this.menuContainer) {
            document.body.removeChild(this.menuContainer);
        }
    }
}
