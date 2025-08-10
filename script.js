// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const gameState = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameMode: 'player', // 'player' or 'computer'
        playerSymbol: 'X',
        computerSymbol: 'O',
        difficulty: 'medium',
        gameActive: false,
        moves: 0
    };

    // DOM Elements
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const playerModeBtn = document.getElementById('player-mode');
    const computerModeBtn = document.getElementById('computer-mode');
    const difficultyGroup = document.getElementById('difficulty-group');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const resetBtn = document.getElementById('reset-btn');
    const symbolButtons = document.querySelectorAll('[data-symbol]');
    const difficultyButtons = document.querySelectorAll('[data-level]');

    // Initialize game
    initGame();

    function initGame() {
        // Set up event listeners
        boardElement.addEventListener('click', handleCellClick);
        playerModeBtn.addEventListener('click', () => setGameMode('player'));
        computerModeBtn.addEventListener('click', () => setGameMode('computer'));
        startBtn.addEventListener('click', startNewGame);
        restartBtn.addEventListener('click', restartGame);
        resetBtn.addEventListener('click', resetGame);
        
        // Symbol selection
        symbolButtons.forEach(button => {
            button.addEventListener('click', () => {
                symbolButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                gameState.playerSymbol = button.dataset.symbol;
                gameState.computerSymbol = gameState.playerSymbol === 'X' ? 'O' : 'X';
            });
        });
        
        // Difficulty selection
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                gameState.difficulty = button.dataset.level;
            });
        });
    }

    function setGameMode(mode) {
        gameState.gameMode = mode;
        playerModeBtn.classList.toggle('active', mode === 'player');
        computerModeBtn.classList.toggle('active', mode === 'computer');
    
        // Show difficulty only for computer mode
        difficultyGroup.style.display = mode === 'computer' ? 'block' : 'none';
    
        document.querySelector('.footer p').innerHTML =
            `Designed with ❤️ | Tic Tac Toe v1.0 | <span class="highlight-text">${
                mode === 'player' ? 'Player vs Player' : 'Player vs Computer'
            }</span> mode`;
    }
    

    function startNewGame() {
        // Reset game state
        gameState.board = ['', '', '', '', '', '', '', '', ''];
        gameState.currentPlayer = 'X';
        gameState.gameActive = true;
        gameState.moves = 0;
        
        // Reset board UI
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'win');
        });
        
        // Update status
        updateStatus();
        
        // If computer starts and player is O
        if (gameState.gameMode === 'computer' && gameState.playerSymbol === 'O') {
            setTimeout(computerMove, 500);
        }
    
        // Scroll to game panel
        document.querySelector('.game-panel').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    

    function restartGame() {
            startNewGame();
        
    }

    function resetGame() {
        // Reset all settings to default
        setGameMode('player');
        gameState.playerSymbol = 'X';
        gameState.computerSymbol = 'O';
        gameState.difficulty = 'medium';
        
        // Reset button states
        symbolButtons[0].classList.add('active');
        symbolButtons[1].classList.remove('active');
        
        difficultyButtons[0].classList.remove('active');
        difficultyButtons[1].classList.add('active');
        difficultyButtons[2].classList.remove('active');
        
        // Start a new game
        startNewGame();
    }

    function handleCellClick(event) {
        if (!gameState.gameActive) return;
        
        const cell = event.target.closest('.cell');
        if (!cell) return;
        
        const index = parseInt(cell.dataset.index);
        
        // Check if cell is empty
        if (gameState.board[index] !== '') return;
        
        // Make move
        makeMove(index, gameState.currentPlayer);
        
        // Check for win or draw
        const winResult = checkWin();
        if (winResult.winner) {
            endGame(winResult.winner, winResult.pattern);
            return;
        } else if (gameState.moves === 9) {
            endGame(null); // Draw
            return;
        }
        
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
        
        // Computer move if in computer mode and it's computer's turn
        if (gameState.gameMode === 'computer' && 
            gameState.currentPlayer === gameState.computerSymbol) {
            setTimeout(computerMove, 600);
        }
    }

    function makeMove(index, player) {
        gameState.board[index] = player;
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        gameState.moves++;
    }

    function computerMove() {
        if (!gameState.gameActive) return;
        
        let moveIndex;
        
        // Different strategies based on difficulty
        switch (gameState.difficulty) {
            case 'easy':
                // Random moves
                moveIndex = getRandomMove();
                break;
            case 'medium':
                // Sometimes blocks or wins, sometimes random
                moveIndex = getSmartMove() || getRandomMove();
                break;
            case 'hard':
                // Always tries to win or block
                moveIndex = getSmartMove();
                if (moveIndex === null) moveIndex = getRandomMove();
                break;
        }
        
        if (moveIndex !== null) {
            makeMove(moveIndex, gameState.computerSymbol);
            
            // Check win/draw
            const winResult = checkWin();
            if (winResult.winner) {
                endGame(winResult.winner, winResult.pattern);
                return;
            } else if (gameState.moves === 9) {
                endGame(null); // Draw
                return;
            }
            
            // Switch to player
            gameState.currentPlayer = gameState.playerSymbol;
            updateStatus();
        }
    }

    function getRandomMove() {
        const emptyCells = [];
        gameState.board.forEach((cell, index) => {
            if (cell === '') emptyCells.push(index);
        });
        
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    function getSmartMove() {
        // Check for winning move
        for (let i = 0; i < gameState.board.length; i++) {
            if (gameState.board[i] === '') {
                gameState.board[i] = gameState.computerSymbol;
                if (checkWin().winner === gameState.computerSymbol) {
                    gameState.board[i] = '';
                    return i;
                }
                gameState.board[i] = '';
            }
        }
        
        // Check for blocking opponent's winning move
        for (let i = 0; i < gameState.board.length; i++) {
            if (gameState.board[i] === '') {
                gameState.board[i] = gameState.playerSymbol;
                if (checkWin().winner === gameState.playerSymbol) {
                    gameState.board[i] = '';
                    return i;
                }
                gameState.board[i] = '';
            }
        }
        
        // Try to take center if available
        if (gameState.board[4] === '') return 4;
        
        // Try to take corners
        const corners = [0, 2, 6, 8];
        for (const corner of corners) {
            if (gameState.board[corner] === '') return corner;
        }
        
        // Otherwise take any edge
        const edges = [1, 3, 5, 7];
        for (const edge of edges) {
            if (gameState.board[edge] === '') return edge;
        }
        
        return null;
    }

    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameState.board[a] && 
                gameState.board[a] === gameState.board[b] && 
                gameState.board[a] === gameState.board[c]) {
                return {
                    winner: gameState.board[a],
                    pattern: pattern
                };
            }
        }
        
        return { winner: null };
    }

    function endGame(winner, pattern) {
        gameState.gameActive = false;
    
        if (winner) {
            if (pattern) {
                pattern.forEach(index => {
                    const cell = document.querySelector(`.cell[data-index="${index}"]`);
                    cell.classList.add('win');
                });
            }
            statusElement.textContent = winner === gameState.playerSymbol ? 
                'You win! 🎉' : 
                gameState.gameMode === 'player' ? 
                    `Player ${winner} wins!` : 
                    'Computer wins!';
        } else {
            statusElement.textContent = "It's a draw!";
        }
        statusElement.classList.add('highlight');
    
        // Show custom modal instead of confirm
        document.getElementById('endgame-modal').style.display = 'flex';
    
        // Modal buttons
        document.getElementById('modal-restart').onclick = () => {
            document.getElementById('endgame-modal').style.display = 'none';
            restartGame();
        };
        document.getElementById('modal-reset').onclick = () => {
            document.getElementById('endgame-modal').style.display = 'none';
            resetGame();
        };
    }
    
    

    function updateStatus() {
        statusElement.classList.remove('highlight');
        
        if (gameState.gameActive) {
            if (gameState.gameMode === 'computer' && 
                gameState.currentPlayer === gameState.computerSymbol) {
                statusElement.textContent = 'Computer thinking...';
            } else {
                statusElement.textContent = gameState.gameMode === 'player' ?
                    `Player ${gameState.currentPlayer}'s turn` :
                    gameState.currentPlayer === gameState.playerSymbol ?
                        'Your turn' :
                        'Computer\'s turn';
            }
        }
    }
});