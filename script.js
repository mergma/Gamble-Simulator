const moneyInput = document.getElementById('money');
const playButton = document.getElementById('play');
const resetButton = document.getElementById('reset');
const resultDiv = document.getElementById('result');
const balanceDiv = document.getElementById('balance');
const betDiv = document.getElementById('bet');
const autoPlayCheckbox = document.getElementById('auto-play');
const goal1 = document.getElementById('goal-1');
const goal2 = document.getElementById('goal-2');
const goal3 = document.getElementById('goal-3');
const easyButton = document.getElementById('easy');
const mediumButton = document.getElementById('medium');
const hardButton = document.getElementById('hard');
const insaneButton = document.getElementById('insane');
const gameContent = document.getElementById('game-content');
const gameoverDiv = document.getElementById('gameover');
let timeoutId = null;
let balance = 100;
let bet = 0;
let N = 5;
let difficulty = '';
let winStats = {
    superJackpot: 0,
    jackpot: 0,
    twoOfAKind: 0,
    losses: 0
};

const difficultyOdds = {
    easy: {
        superJackpot: 0.05,    // 0.05%
        jackpot: 1.00,         // 1%
        twoOfKind: 48.95,      // 48.95%
        losses: 50.00          // 50%
    },
    medium: {
        superJackpot: 0.02,    // 0.02%
        jackpot: 0.48,         // 0.48%
        twoOfKind: 45.50,      // 45.5%
        losses: 54.00          // 54%
    },
    hard: {
        superJackpot: 0.01,    // 0.01%
        jackpot: 0.36,         // 0.36%
        twoOfKind: 43.20,      // 43.2%
        losses: 56.43          // 56.43%
    },
    insane: {
        superJackpot: 0.005,   // 0.005%
        jackpot: 0.195,        // 0.195%
        twoOfKind: 39.80,      // 39.8%
        losses: 60.00          // 60%
    }
};

function updateOddsDisplay(difficulty) {
    document.getElementById('super-jackpot-odds').textContent = difficultyOdds[difficulty].superJackpot.toFixed(3);
    document.getElementById('jackpot-odds').textContent = difficultyOdds[difficulty].jackpot.toFixed(2);
    document.getElementById('two-kind-odds').textContent = difficultyOdds[difficulty].twoOfKind.toFixed(2);
    document.getElementById('losses-odds').textContent = difficultyOdds[difficulty].losses.toFixed(2);
}

easyButton.addEventListener('click', () => {
    N = 5;
    difficulty = 'easy';
    gameContent.style.display = 'block';
    document.getElementById('difficulty').style.display = 'none';
    document.getElementById('difficultydisp').innerText = 'Difficulty : First Time Gambler';
    updateOddsDisplay('easy');
});
mediumButton.addEventListener('click', () => {
    N = 10;
    difficulty = 'medium';
    gameContent.style.display = 'block';
    document.getElementById('difficulty').style.display = 'none';
    document.getElementById('difficultydisp').innerText = 'Difficulty : Average Gambler';
    updateOddsDisplay('medium');
});

hardButton.addEventListener('click', () => {
    N = 20;
    difficulty = 'hard';
    gameContent.style.display = 'block';
    document.getElementById('difficulty').style.display = 'none';
    document.getElementById('difficultydisp').innerText = 'Difficulty : Serious Gambler';
    updateOddsDisplay('hard');
});
insaneButton.addEventListener('click', () => {
    N = 25;
    difficulty = 'insane';
    gameContent.style.display = 'block';
    document.getElementById('difficulty').style.display = 'none';
    document.getElementById('difficultydisp').innerText = "Difficulty : The House";
    updateOddsDisplay('insane');
});

playButton.addEventListener('click', () => {
    playButton.disabled = true;
    playButton.classList.add('cooldown');
    playGame();
    setTimeout(() => {
        playButton.disabled = false;
        playButton.classList.remove('cooldown');
    }, 300);
});
resetButton.addEventListener('click', resetGame);

function playGame() {
    try {
        let money = parseFloat(moneyInput.value);
        if (isNaN(money) || money <= 0) {
            resultDiv.innerText = 'Nice joke, im gonna need atleast a dollar.';
            return;
        }

        if (money > balance) {
            money = balance;
            moneyInput.value = money;
        }

        bet = money;
        betDiv.innerText = `Bet: $${bet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const a = Math.floor(Math.random() * N) + 1;
        const b = Math.floor(Math.random() * N) + 1;
        const c = Math.floor(Math.random() * N) + 1;
        const d = Math.floor(Math.random() * N) + 1;

        const allNumbers = [a, b, c, d];
        const counts = {};

        // Count occurrences of each number
        allNumbers.forEach(num => counts[num] = (counts[num] || 0) + 1);

        // Find maximum occurrence
        const maxCount = Math.max(...Object.values(counts));

        // Generate the result text
        let resultText = '';
        resultText += allNumbers.map(num => counts[num] > 1 ? `<span class="glow" style="color: ${maxCount === 4 ? 'red' : 'green'}">${num}</span>` : num).join(' | ') + '\n';

        let winnings = 0;

        // Determine the winnings based on the number of matches
        if (maxCount === 4) {
            resultText += '<br>Super Jackpot!<br>';
            winnings = bet * 4;
            winStats.superJackpot++;
        } else if (maxCount === 3) {
            resultText += '<br>Jackpot!<br>';
            winnings = bet * 3;
            winStats.jackpot++;
        } else if (maxCount === 2) {
            resultText += '<br>Two of a kind. not going to get you far.<br>';
            winnings = bet * 1.5;  // Assuming winnings = (bet / 2) * 3 = bet * 1.5
            winStats.twoOfAKind++;
        } else {
            var failedtextOptions = [
                "Are you gonna let that loss stop you?.",
                "You're not very lucky today.",
                "Better luck next time.",
                "Don't give up just yet! you're gonna win this next one!.",
                "Keep trying, you'll get it! eventually..."
            ];
            var failedtext = failedtextOptions[Math.floor(Math.random() * failedtextOptions.length)];
            resultText += '<br>' + failedtext + '<br>';  
            balance -= bet;
            winStats.losses++;
        }

        balance += winnings;
        resultText += `You Won: $${winnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>`;
        resultDiv.innerHTML = resultText;
        displayWinStats();
        balanceDiv.innerText = `Balance: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        checkGoals();

        if (balance === 0) {
            displayGameOver();
        }

        if (autoPlayCheckbox.checked) {
            timeoutId = setTimeout(playGame, 300);
        }
    } catch (error) {
        resultDiv.innerText = 'Error: ' + error.message;
    }
}

function resetGame() {
    moneyInput.value = '';
    resultDiv.innerText = '';
    balanceDiv.innerText = `Balance: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    betDiv.innerText = '';
    autoPlayCheckbox.checked = false;
    clearTimeout(timeoutId);
    balance = 0;
    bet = 0;
    goal1.style.textDecoration = 'none';
    goal2.style.textDecoration = 'none';
    goal3.style.textDecoration = 'none';
    gameoverDiv.style.display = 'none';
}

function displayWinStats() {
    const superJackpotElement = document.getElementById('super-jackpot');
    const jackpotElement = document.getElementById('jackpot');
    const twoOfAKindElement = document.getElementById('two-of-a-kind');
    const lossesElement = document.getElementById('losses');

    superJackpotElement.textContent = winStats.superJackpot;
    jackpotElement.textContent = winStats.jackpot;
    twoOfAKindElement.textContent = winStats.twoOfAKind;
    lossesElement.textContent = winStats.losses;
}

function checkGoals() {
    if (balance >= 200) {
        goal1.style.textDecoration = 'line-through';
    }
    if (balance >= 500) {
        goal2.style.textDecoration = 'line-through';
    }
    if (balance >= 1000) {
        goal3.style.textDecoration = 'line-through';
    }
}

function displayGameOver() {
    let gameOverText = '';
    switch (difficulty) {
        case 'easy':
            gameOverText = 'Care to invest another 100?.';
            break;
        case 'medium':
            gameOverText = 'They say 99% of gamblers quit before winning big.';
            break;
        case 'hard':
            gameOverText = 'The next game would be on your side.';
            break;
        case 'insane':
            resultDiv.innerText = 'oh noo, you lost all your money! how unfortunate.';
            gameOverText = "Sorry, we decide who wins.";
            break;
        default:
            gameOverText = 'Game Over.';
    }
    gameoverDiv.innerText = gameOverText;
    gameoverDiv.style.display = 'block';
}
