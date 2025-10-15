// Simple User Management
let users = JSON.parse(localStorage.getItem('ticTacUsers') || '[]');

// Add default user if none exists
if (users.length === 0) {
    users.push({
        username: "player",
        email: "player@example.com", 
        password: "1234",
        stats: { wins: 0, losses: 0, draws: 0 }
    });
// Save users to localStorage
try {
    localStorage.setItem('ticTacUsers', JSON.stringify(users));
    console.log('Users saved to localStorage');
} catch (error) {
    console.error('Error saving to localStorage:', error);
}}

// DOM Elements
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const gameContainer = document.querySelector('.game-container');

// Switch between forms
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

// Login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        showGame(user);
    } else {
        alert('Invalid login! Try: player/1234');
    }
});

// Register
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }
    
    const newUser = {
        username,
        email,
        password,
        stats: { wins: 0, losses: 0, draws: 0 }
    };
    
    users.push(newUser);
    localStorage.setItem('ticTacUsers', JSON.stringify(users));
    alert('Registration successful!');
    registerBox.style.display = 'none';
    loginBox.style.display = 'block';
    registerForm.reset();
});

// Show Game - FIXED
function showGame(user) {
    document.querySelector('.auth-container').style.display = 'none';
    gameContainer.style.display = 'block';
    
    gameContainer.innerHTML = `
        <h1>Tic Tac Toe</h1>
        <div class="player-info">Welcome, ${user.username}! (W:${user.stats.wins} L:${user.stats.losses} D:${user.stats.draws})</div>
        
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
    
    // Initialize game
    initGame(user);
}

// Game Logic - COMPLETELY FIXED
function initGame(user) {
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let scores = { player: 0, computer: 0, draw: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6]
    ];

    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const logoutButton = document.getElementById('logout');

    // Cell click handler - SIMPLE & WORKING
    function handleCellClick(e) {
        if (!gameActive || currentPlayer !== 'X') return;
        
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        if (gameState[index] !== '') return;
        
        // Human move
        makeMove(index, 'X');
        cell.classList.add('player-move');
        
        if (checkGameResult()) return;
        
        // Computer move
        currentPlayer = 'O';
        statusDisplay.textContent = 'Computer thinking...';
        
        setTimeout(() => {
            if (gameActive) {
                const compMove = getComputerMove();
                makeMove(compMove, 'O');
                document.querySelector(`[data-index="${compMove}"]`).classList.add('computer-move');
                checkGameResult();
            }
        }, 800);
    }

    // Add event listeners to cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    function makeMove(index, player) {
        gameState[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }

    function getComputerMove() {
        const difficulty = document.getElementById('difficulty').value;
        let available = gameState.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        
        if (difficulty === 'easy') {
            return available[Math.floor(Math.random() * available.length)];
        }
        
        // Try to win
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] === 'O' && gameState[b] === 'O' && gameState[c] === '') return c;
            if (gameState[a] === 'O' && gameState[c] === 'O' && gameState[b] === '') return b;
            if (gameState[b] === 'O' && gameState[c] === 'O' && gameState[a] === '') return a;
        }
        
        // Block player
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] === 'X' && gameState[b] === 'X' && gameState[c] === '') return c;
            if (gameState[a] === 'X' && gameState[c] === 'X' && gameState[b] === '') return b;
            if (gameState[b] === 'X' && gameState[c] === 'X' && gameState[a] === '') return a;
        }
        
        // Take center or random
        if (gameState[4] === '') return 4;
        return available[Math.floor(Math.random() * available.length)];
    }

    function checkGameResult() {
        // Check win
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                gameActive = false;
                condition.forEach(idx => {
                    document.querySelector(`[data-index="${idx}"]`).classList.add('winner');
                });
                
                if (gameState[a] === 'X') {
                    statusDisplay.textContent = 'You Win! 🎉';
                    scores.player++;
                    user.stats.wins++;
                } else {
                    statusDisplay.textContent = 'Computer Wins! 🤖';
                    scores.computer++;
                    user.stats.losses++;
                }
                updateScores();
                saveUserStats();
                return true;
            }
        }

        // Check draw
        if (!gameState.includes('')) {
            gameActive = false;
            statusDisplay.textContent = 'Game Draw! 🤝';
            scores.draw++;
            user.stats.draws++;
            updateScores();
            saveUserStats();
            return true;
        }

        currentPlayer = 'X';
        statusDisplay.textContent = 'Your Turn (X)';
        return false;
    }

    function updateScores() {
        document.getElementById('playerScore').textContent = scores.player;
        document.getElementById('computerScore').textContent = scores.computer;
        document.getElementById('drawScore').textContent = scores.draw;
    }

    function saveUserStats() {
        localStorage.setItem('ticTacUsers', JSON.stringify(users));
    }

    // NEW GAME BUTTON - FIXED & WORKING
    resetButton.addEventListener('click', function() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        statusDisplay.textContent = 'Your Turn (X)';
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner', 'player-move', 'computer-move');
        });
    });

    // Logout button
    logoutButton.addEventListener('click', function() {
        gameContainer.style.display = 'none';
        document.querySelector('.auth-container').style.display = 'block';
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    });
}
