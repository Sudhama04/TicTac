// User Management System
class UserManager {
    constructor() {
        this.users = this.loadUsers();
    }

    loadUsers() {
        try {
            // For demo - in real scenario, this would fetch from a server
            const defaultUsers = {
                users: [
                    {
                        username: "player",
                        email: "player@example.com",
                        password: "1234",
                        createdAt: new Date().toISOString(),
                        stats: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 }
                    }
                ]
            };
            return defaultUsers.users;
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    saveUsers() {
        // In a real app, this would send data to a server
        console.log('Users saved (simulated):', this.users);
        localStorage.setItem('ticTacUsers', JSON.stringify(this.users));
    }

    registerUser(username, email, password) {
        // Check if user already exists
        if (this.users.find(user => user.username === username)) {
            return { success: false, message: 'Username already exists' };
        }

        if (this.users.find(user => user.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            username,
            email,
            password, // In real app, hash this password
            createdAt: new Date().toISOString(),
            stats: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 }
        };

        this.users.push(newUser);
        this.saveUsers();

        return { success: true, message: 'Registration successful!' };
    }

    loginUser(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            return { success: true, user };
        }
        return { success: false, message: 'Invalid username or password' };
    }

    updateUserStats(username, result) {
        const user = this.users.find(u => u.username === username);
        if (user) {
            user.stats.gamesPlayed++;
            
            if (result === 'win') user.stats.wins++;
            else if (result === 'loss') user.stats.losses++;
            else if (result === 'draw') user.stats.draws++;
            
            this.saveUsers();
        }
    }
}

// Initialize User Manager
const userManager = new UserManager();

// DOM Elements
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const gameContainer = document.querySelector('.game-container');

// Switch between login and register forms
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerBox.style.display = 'none';
    loginBox.style.display = 'block';
});

// Login Form Handler
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = userManager.loginUser(username, password);
    
    if (result.success) {
        showGame(result.user);
    } else {
        showMessage(result.message, 'error');
    }
});

// Register Form Handler
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 4) {
        showMessage('Password must be at least 4 characters', 'error');
        return;
    }
    
    const result = userManager.registerUser(username, email, password);
    
    if (result.success) {
        showMessage(result.message, 'success');
        // Switch to login form after successful registration
        setTimeout(() => {
            registerBox.style.display = 'none';
            loginBox.style.display = 'block';
            registerForm.reset();
        }, 1500);
    } else {
        showMessage(result.message, 'error');
    }
});

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const currentForm = loginBox.style.display !== 'none' ? loginBox : registerBox;
    currentForm.insertBefore(messageDiv, currentForm.querySelector('form'));
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showGame(user) {
    document.querySelector('.auth-container').style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Create game HTML with user stats
    gameContainer.innerHTML = `
        <h1>Tic Tac Toe</h1>
        <div class="player-info">
            Welcome, ${user.username}! 
            <br>Stats: ${user.stats.wins}W ${user.stats.losses}L ${user.stats.draws}D
        </div>
        
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
    
    initializeGame(user);
    
    // Logout button
    document.getElementById('logout').addEventListener('click', function() {
        gameContainer.style.display = 'none';
        document.querySelector('.auth-container').style.display = 'block';
        loginForm.reset();
    });
}

// Game Logic (same as before but with stats tracking)
function initializeGame(user) {
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const difficultySelect = document.getElementById('difficulty');

    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let sessionScores = { player: 0, computer: 0, draw: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.classList.remove('x', 'o', 'winner', 'draw', 'player-move', 'computer-move');
    });

    function handleCellClick(clickedCellEvent) {
        if (!gameActive || currentPlayer !== 'X') return;

        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== '') return;

        makeMove(clickedCellIndex, 'X');
        clickedCell.classList.add('player-move');

        if (checkResult()) return;

        currentPlayer = 'O';
        statusDisplay.innerHTML = 'Computer thinking...';
        statusDisplay.classList.add('computer-thinking');

        setTimeout(() => {
            if (gameActive) {
                const computerMove = getComputerMove();
                makeMove(computerMove, 'O');
                document.querySelector(`[data-index="${computerMove}"]`).classList.add('computer-move');
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

        if (difficulty === 'easy') {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        if (difficulty === 'medium') {
            if (Math.random() < 0.7) {
                const smartMove = findWinningMove('O') || findWinningMove('X') || findBestMove();
                if (smartMove !== -1) return smartMove;
            }
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

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
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                gameActive = false;
                highlightWinningCells(condition);
                
                if (gameState[a] === 'X') {
                    statusDisplay.innerHTML = 'You Win! 🎉';
                    sessionScores.player++;
                    userManager.updateUserStats(user.username, 'win');
                } else {
                    statusDisplay.innerHTML = 'Computer Wins! 🤖';
                    sessionScores.computer++;
                    userManager.updateUserStats(user.username, 'loss');
                }
                
                updateScores();
                updatePlayerStats();
                return true;
            }
        }

        if (!gameState.includes('')) {
            gameActive = false;
            statusDisplay.innerHTML = 'Game Draw! 🤝';
            cells.forEach(cell => cell.classList.add('draw'));
            sessionScores.draw++;
            userManager.updateUserStats(user.username, 'draw');
            updateScores();
            updatePlayerStats();
            return true;
        }

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
        document.getElementById('playerScore').textContent = sessionScores.player;
        document.getElementById('computerScore').textContent = sessionScores.computer;
        document.getElementById('drawScore').textContent = sessionScores.draw;
    }

    function updatePlayerStats() {
        const currentUser = userManager.users.find(u => u.username === user.username);
        if (currentUser) {
            const statsElement = document.querySelector('.player-info');
            statsElement.innerHTML = `Welcome, ${user.username}! <br>Stats: ${currentUser.stats.wins}W ${currentUser.stats.losses}L ${currentUser.stats.draws}D`;
        }
    }

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
