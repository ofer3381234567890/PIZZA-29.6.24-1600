const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const startGameButton = document.getElementById('startGameButton');
const restartGameButton = document.getElementById('restartGameButton');
const scoreDisplay = document.getElementById('score');
const openingSlideshow = document.getElementById('openingSlideshow');
const endingVideo = document.getElementById('endingVideo');
const loadingMessage = document.getElementById('loadingMessage');
const backgroundMusic = document.getElementById('backgroundMusic');
const endMessage = document.getElementById('endMessage');
let bullets = [];
let aliens = [];
let score = 0;
let gameRunning = false;

startGameButton.addEventListener('click', () => {
    startGameButton.style.display = 'none';
    loadingMessage.style.display = 'block';
    playOpeningSlideshow();
});

restartGameButton.addEventListener('click', () => {
    restartGame();
});

function restartGame() {
    gameRunning = true;
    restartGameButton.style.display = 'none';
    endMessage.style.display = 'none';
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    while (bullets.length > 0) {
        bullets.pop().remove();
    }
    while (aliens.length > 0) {
        aliens.pop().remove();
    }
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
}

function playOpeningSlideshow() {
    openingSlideshow.style.display = 'block';
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    const video = openingSlideshow.querySelector('video');
    video.play();

    video.addEventListener('ended', () => {
        openingSlideshow.style.display = 'none';
        loadingMessage.style.display = 'none';
        if (!gameRunning) {
            startGame();
        }
    });
}

function startGame() {
    gameRunning = true;
    backgroundMusic.play();
    spawnAliens();
    handlePlayerMovement();

    // Start ending video after 8 seconds if game is not restarted
    setTimeout(() => {
        if (!gameRunning) {
            playEndingVideo();
        }
    }, 8000);
}

function endGame() {
    gameRunning = false;
    backgroundMusic.pause();
    endMessage.style.display = 'block';
    restartGameButton.style.display = 'block';
    scoreDisplay.style.fontSize = '36px';
    scoreDisplay.style.backgroundColor = 'orange';

    // Show ending video and restart button after 8 seconds
    setTimeout(() => {
        if (!gameRunning) {
            playEndingVideo();
            restartGameButton.style.display = 'block';
        }
    }, 8000);
}

function playEndingVideo() {
    gameRunning = false;
    endingVideo.style.display = 'block';
    endingVideo.play();
    endingVideo.addEventListener('ended', () => {
        endingVideo.style.display = 'none';
    });
}

function handlePlayerMovement() {
    let playerX = window.innerWidth / 2;
    let playerY = window.innerHeight - 200;
    player.style.left = `${playerX}px`;
    player.style.bottom = `${playerY}px`;

    window.addEventListener('mousemove', (event) => {
        playerX = event.clientX;
        if (playerX < player.offsetWidth / 2) {
            playerX = player.offsetWidth / 2;
        }
        if (playerX > window.innerWidth - player.offsetWidth / 2) {
            playerX = window.innerWidth - player.offsetWidth / 2;
        }
        player.style.left = `${playerX}px`;
    });

    window.addEventListener('click', () => {
        if (gameRunning) {
            shootBullet(playerX, playerY);
        }
    });
}

function shootBullet(x, y) {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${x}px`;
    bullet.style.bottom = `${y}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);

    const bulletMoveInterval = setInterval(() => {
        bullet.style.bottom = `${parseInt(bullet.style.bottom) + 10}px`;

        // Check collision with aliens
        aliens.forEach((alien, index) => {
            if (checkCollision(bullet, alien)) {
                handleCollision(alien, bullet);
                clearInterval(bulletMoveInterval);
            }
        });

        // Remove bullet if it goes out of bounds
        if (parseInt(bullet.style.bottom) > window.innerHeight) {
            bullet.remove();
            bullets.splice(bullets.indexOf(bullet), 1);
            clearInterval(bulletMoveInterval);
        }
    }, 16);
}

function spawnAliens() {
    const alienSpawnInterval = setInterval(() => {
        if (gameRunning) {
            const alien = document.createElement('div');
            alien.className = 'alien';
            alien.style.left = `${Math.random() * (window.innerWidth - 75)}px`;
            alien.style.top = `${-75}px`;
            gameContainer.appendChild(alien);
            aliens.push(alien);

            const alienMoveInterval = setInterval(() => {
                alien.style.top = `${parseInt(alien.style.top) + 2}px`;

                // Check collision with player
                if (checkCollision(player, alien)) {
                    endGame();
                }

                // Remove alien if it goes out of bounds
                if (parseInt(alien.style.top) > window.innerHeight) {
                    alien.remove();
                    aliens.splice(aliens.indexOf(alien), 1);
                    clearInterval(alienMoveInterval);
                }
            }, 16);
        }
    }, 2000);
}

function handleCollision(alien, bullet) {
    const explosion = document.createElement('img');
    explosion.src = 'explosion.gif';
    explosion.style.position = 'absolute';
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.left = `${parseInt(alien.style.left) + 37.5}px`;
    explosion.style.top = `${parseInt(alien.style.top) + 37.5}px`;
    gameContainer.appendChild(explosion);
    setTimeout(() => {
        explosion.remove();
    }, 1000);

    bullet.remove();
    bullets.splice(bullets.indexOf(bullet), 1);
    alien.remove();
    aliens.splice(aliens.indexOf(alien), 1);
    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
}

function checkCollision(obj1, obj2) {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}
