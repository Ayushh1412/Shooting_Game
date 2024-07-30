document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const fighterJet = new Image();
      fighterJet.src = "fighter_jet.png";


  const meteor = new Image();
      meteor.src = "meteor2.png";

  const starImage = new Image();
      starImage.src = "powerup.png";


  const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 80,
    height: 50,
    speed: 5,
    dx: 0,
    fireCooldown: 0,
    fireRate: 25,
  };

  const bullets = [];
  const enemies = [];
  const powerUps = [];
  let score = 0;
  let isGameOver = false;
  let isGamePaused = false;
  let difficulty = 1; // Initial difficulty

  function drawPlayer() {
    ctx.beginPath();
    ctx.drawImage(fighterJet,player.x, player.y, player.width, player.height);
    ctx.fill();
    ctx.closePath();
  }

  function drawBullet(bullet) {
    ctx.beginPath();
    ctx.rect(bullet.x, bullet.y, 5, 15);
    ctx.fillStyle = "#f39c12";
    ctx.fill();
    ctx.closePath();
  }

  function drawEnemy(enemy) {
    ctx.beginPath();
    ctx.drawImage(meteor,enemy.x, enemy.y, 50, 50);
    ctx.fill();
    ctx.closePath();
  }
  function drawStar(powerUp) {
    ctx.drawImage(starImage, powerUp.x, powerUp.y - 30,50,50);
  }

  function drawPowerUp(powerUp) {
    ctx.beginPath();
    drawStar(powerUp)
    ctx.fill();
    ctx.closePath();
  }

  function collisionDetection(bullet, enemy) {
    return (
      bullet.x < enemy.x + 50 &&
      bullet.x + 5 > enemy.x &&
      bullet.y < enemy.y + 50 &&
      bullet.y + 15 > enemy.y
    );
  }

  function collisionDetectionPlayer(player, powerUp) {
    const distance = Math.sqrt(
      Math.pow(player.x - powerUp.x, 2) + Math.pow(player.y - powerUp.y, 2)
    );
    return distance < player.width / 2 + 15;
  }

  function shoot() {
    if (player.fireCooldown <= 0) {
      bullets.push({ x: player.x + player.width / 2, y: player.y - 15 });
      player.fireCooldown = player.fireRate;
    }
  }

  function generateEnemy() {
    enemies.push({
      x: Math.random() * (canvas.width - 50),
      y: 0,
      speed: Math.random() * difficulty + 1,
    });
  }

  function generatePowerUp() {
    powerUps.push({
      x: Math.random() * (canvas.width - 30),
      y: 0,
      effect: {
        damage: Math.random() < 0.5 ? 2 : -2,
        speed: Math.random() * difficulty + 1,
        fireRate: Math.random() < 0.5 ? -5 : 5,
      },
    });
  }

  function draw() {
    if (isGameOver || isGamePaused) {
      if (isGamePaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "30px Arial";
        ctx.fillText("Paused", canvas.width / 2 - 50, canvas.height / 2);
      } else {
        document.getElementById("gameOver").style.display = "block";
        document.getElementById("finalScore").innerText = score;
        document.getElementById("restartButton").style.display = "block";
      }
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();

    for (const bullet of bullets) {
      drawBullet(bullet);
      bullet.y -= 10;

      for (const enemy of enemies) {
        if (collisionDetection(bullet, enemy)) {
          bullets.splice(bullets.indexOf(bullet), 1);
          enemies.splice(enemies.indexOf(enemy), 1);
          score += 10;
        }
      }
    }

    for (const powerUp of powerUps) {
      drawPowerUp(powerUp);
      powerUp.y += powerUp.effect.speed;

      if (collisionDetectionPlayer(player, powerUp)) {
        player.speed += powerUp.effect.speed;
        score += powerUp.effect.damage;
        player.fireRate += powerUp.effect.fireRate;
        powerUps.splice(powerUps.indexOf(powerUp), 1);
      }

      if (powerUp.y > canvas.height) {
        powerUps.splice(powerUps.indexOf(powerUp), 1);
      }
    }

    for (const enemy of enemies) {
      drawEnemy(enemy);
      enemy.y += enemy.speed;

      if (enemy.y > canvas.height) {
        enemies.splice(enemies.indexOf(enemy), 1);
        score -= 5;
      }

      if (
        enemy.y + 50 > player.y &&
        enemy.x < player.x + player.width &&
        enemy.x + 50 > player.x
      ) {
        isGameOver = true;
      }
    }

    document.getElementById("score").innerText = "Score: " + score;

    if (Math.random() < 0.02) {
      generateEnemy();
    }

    if (Math.random() < 0.01) {
      generatePowerUp();
    }

    player.fireCooldown = Math.max(0, player.fireCooldown - 1);
    // Auto-fire at a constant interval
    if (frameCount % 5 === 0) {
      shoot();
    }

    frameCount++;

    requestAnimationFrame(draw);
  }

  let frameCount = 0;

  document.getElementById("restartButton").addEventListener("click", function () {
    restartGame();
  });

  document.getElementById("settingsButton").addEventListener("click", function () {
    toggleSettings();
  });

  document.getElementById("difficultySlider").addEventListener("input", function () {
    difficulty = parseFloat(this.value);
  });

  function toggleSettings() {
    isGamePaused = !isGamePaused;
    draw();
    const settings = document.getElementById("settings");
    settings.style.display = isGamePaused ? "block" : "none";
  }

  function restartGame() {
    bullets.length = 0;
    enemies.length = 0;
    powerUps.length = 0;
    score = 0;
    isGameOver = false;
    isGamePaused = false;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    player.speed = 5;
    player.fireCooldown = 0;
    player.fireRate = 25;
    document.getElementById("gameOver").style.display = "none";
    document.getElementById("restartButton").style.display = "none";
    draw();
  }

  function updatePlayerPosition() {
    player.x += player.dx;
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
  }

  function update() {
    updatePlayerPosition();
    requestAnimationFrame(update);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      player.dx = player.speed;
    } else if (e.key === "ArrowLeft") {
      player.dx = -player.speed;
    } else if (e.key === " ") {
      shoot();
    } else if (e.key === "Escape") {
      toggleSettings();
    }
  });
  // Touch Controls
  document.addEventListener("keyup", function (e) {
    if (e.key === "ArrowRight"|| e.key === "ArrowLeft") {
      player.dx = 0;
    }
  });

  document.getElementById("leftButton").addEventListener("touchstart", function () {
    player.dx = -player.speed;
  });

  document.getElementById("rightButton").addEventListener("touchstart", function () {
    player.dx = player.speed;
  });

  document.getElementById("leftButton").addEventListener("touchend", function () {
    player.dx = 0;
  });

  document.getElementById("rightButton").addEventListener("touchend", function () {
    player.dx = 0;
  });

  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth;
    canvas.height = window.innerHeight > 600 ? 600 : window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
  });

  update();
  draw();
});