export class CongratulationsOverlay {
    constructor(onReturnToMenu) {
        this.onReturnToMenu = onReturnToMenu;
        this.overlay = null;
    }

    show() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.9));
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: Arial, sans-serif;
            text-align: center;
            animation: fadeIn 1s ease-in-out;
        `;
        
        this.overlay.innerHTML = `
            <div style="
                background: rgba(0, 0, 0, 0.8);
                border: 3px solid rgb(87, 64, 64);
                border-radius: 20px;
                padding: 50px;
                text-align: center;
                box-shadow: 0 0 40px rgba(87, 64, 64, 0.8);
                animation: glow 2s ease-in-out infinite alternate;
            ">
                <h1 style="
                    color: #ab3939;
                    font-size: 4em;
                    text-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
                    margin-bottom: 30px;
                    font-weight: bold;
                    letter-spacing: 4px;
                ">Congratulations</h1>
                
                <p style="
                    color: #fff;
                    font-size: 1.8em;
                    margin-bottom: 40px;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                ">You have successfully completed<br>DUNGEON SPIRIT!</p>
                
                <p style="
                    color: #ccc;
                    font-size: 1.2em;
                    margin-bottom: 40px;
                ">Thank you for playing!</p>

            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes glow {
                    from { box-shadow: 0 0 40px rgba(255, 0, 0, 0.8); }
                    to { box-shadow: 0 0 60px rgba(255, 0, 0, 1); }
                }
            </style>
        `;
        
        document.body.appendChild(this.overlay);
        
        // Add event listener to return button
        this.setupEventListeners();
    }

    setupEventListeners() {
        const returnButton = document.getElementById('return-to-menu-btn');
        if (returnButton) {
            returnButton.addEventListener('click', () => {
                this.hide();
                if (this.onReturnToMenu) {
                    this.onReturnToMenu();
                }
            });
        }
    }

    hide() {
        if (this.overlay && this.overlay.parentNode) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
        }
    }

    destroy() {
        this.hide();
    }
}
