// Login System
const loginForm = document.getElementById('loginForm');
const loginContainer = document.querySelector('.login-container');
const gameContainer = document.querySelector('.game-container');

// Demo credentials
const validUsers = {
    'player': '1234',
    'admin': 'admin',
    'guest': 'guest'
};

// Login form handler
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (validUsers[username] && validUsers[username] === password) {
        showGame(username);
    } else {
        alert('Invalid username or password! Try: player/1234');
    }
});

function showGame(username) {
    loginContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Create game HTML dynamically
    gameContainer.innerHTML = `
        <h1>Tic Tac Toe</h1>
        <div class="player-info">Welcome, ${username}! (You: X | Computer: O)</div>
        
        <div class="score-board">
            <div class="score-item">
                <div class="score-label">You (X)</div>
                <div class="score-value" id="playerScore">0</div>
            </div>
            <div class="score-item">
                <div class="score-label">Draws</div>
                <div class="score-value" id="drawScore">0</div>
            </div>
            <div class="score-item">
                <div class="score-label">Computer (O)</div>
                <div class="score-value" id="computerScore">0</div>
            </div>
        </div>
        
        <div class="difficulty">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
        
        <div class="status" id="status">Your Turn (X)</div>
        <div class="board" id="board">
            <div class="cell" data-index="0"></div>
            <div class="cell" data-index="1"></div>
            <div class="cell" data-index="2"></div>
            <div class="cell" data-index="3"></div>
            <div class="cell" data-index="4"></div>
            <div class="cell" data-index="5"></div>
            <div class="cell" data-index="6"></div>
            <div class="cell" data-index="7"></div>
            <div class="cell" data-index="8"></div>
        </div>
        <div class="game-controls">
            <button id="reset">New Game</button>
            <button id="logout">Logout</button>
        </div>
    `;
    
    initializeGame();
    
    // Logout button
    document.getElementById('logout').addEventListener('click', function() {
        gameContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });
}

// Game Logic - Human vs Computer
function initializeGame() {
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const difficultySelect = document.getElementById('difficulty');

    let currentPlayer = 'X'; // Human always starts
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { player: 0, computer: 0, draw: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    // Initialize cells
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.classList.remove('x', 'o', 'winner', 'draw', 'player-move', 'computer-move');
    });

    function handleCellClick(clickedCellEvent) {
        if (!gameActive || currentPlayer !== 'X') return;

        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== '') return;

        // Human move
        makeMove(clickedCellIndex, 'X');
        clickedCell.classList.add('player-move');

        if (checkResult()) return;

        // Computer's turn
        currentPlayer = 'O';
        statusDisplay.innerHTML = 'Computer thinking...';
        statusDisplay.classList.add('computer-thinking');

        setTimeout(() => {
            if (gameActive) {
                const computerMove = getComputerMove();
                makeMove(computerMove, 'O');
                
                const computerCell = document.querySelector(`[data-index="${computerMove}"]`);
                computerCell.classList.add('computer-move');
                
                checkResult();
            }
        }, 1000);
    }

    function makeMove(index, player) {
        gameState[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }

    function getComputerMove() {
        const difficulty = difficultySelect.value;
        let availableMoves = gameState.map((val, index) => val === '' ? index : null).filter(val => val !== null);

        // Easy: Random moves
        if (difficulty === 'easy') {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // Medium: Sometimes smart, sometimes random
        if (difficulty === 'medium') {
            if (Math.random() < 0.7) { // 70% smart moves
                const smartMove = findWinningMove('O') || findWinningMove('X') || findBestMove();
                if (smartMove !== -1) return smartMove;
            }
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // Hard: Always smart moves
        if (difficulty === 'hard') {
            const winningMove = findWinningMove('O');
            if (winningMove !== -1) return winningMove;

            const blockingMove = findWinningMove('X');
            if (blockingMove !== -1) return blockingMove;

            return findBestMove();
        }

        return availableMoves[0];
    }

    function findWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const line = [gameState[a], gameState[b], gameState[c]];
            
            if (line.filter(cell => cell === player).length === 2) {
                const emptyIndex = condition.find(index => gameState[index] === '');
                if (emptyIndex !== undefined) return emptyIndex;
            }
        }
        return -1;
    }

    function findBestMove() {
        // Prefer center, then corners, then edges
        if (gameState[4] === '') return 4;
        
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => gameState[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(index => gameState[index] === '');
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        return gameState.findIndex(cell => cell === '');
    }

    function checkResult() {
        // Check win
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                gameActive = false;
                highlightWinningCells(condition);
                
                if (gameState[a] === 'X') {
                    statusDisplay.innerHTML = 'You Win! 🎉';
                    scores.player++;
                } else {
                    statusDisplay.innerHTML = 'Computer Wins! 🤖';
                    scores.computer++;
                }
                
                updateScores();
                return true;
            }
        }

        // Check draw
        if (!gameState.includes('')) {
            gameActive = false;
            statusDisplay.innerHTML = 'Game Draw! 🤝';
            cells.forEach(cell => cell.classList.add('draw'));
            scores.draw++;
            updateScores();
            return true;
        }

        // Continue game
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.innerHTML = currentPlayer === 'X' ? 'Your Turn (X)' : 'Computer thinking...';
        statusDisplay.classList.toggle('computer-thinking', currentPlayer === 'O');
        return false;
    }

    function highlightWinningCells(winningCombo) {
        winningCombo.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winner');
        });
    }

    function updateScores() {
        document.getElementById('playerScore').textContent = scores.player;
        document.getElementById('computerScore').textContent = scores.computer;
        document.getElementById('drawScore').textContent = scores.draw;
    }

    // Reset game
    resetButton.addEventListener('click', resetGame);

    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        
        statusDisplay.innerHTML = 'Your Turn (X)';
        statusDisplay.classList.remove('computer-thinking');
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner', 'draw', 'player-move', 'computer-move');
        });
    }
}
