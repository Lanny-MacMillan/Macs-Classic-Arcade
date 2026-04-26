(function () {
  "use strict";

  function initSpaceInvaders(containerElement) {
    const container =
      containerElement || document.querySelector(".game-wrapper");

    const canvas =
      document.getElementById("gameCanvas") || document.createElement("canvas");
    canvas.id = "gameCanvas";
    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;
    const MAX_LEVEL = 10;

    const gameState = {
      status: "playing",
      score: 0,
      level: 1,
      lives: 3,
      paused: false,
      enemySpeed: 0.5,
      enemyDirection: 1,
      enemyDropDistance: 15,
      shootCooldown: 0,
      shootCooldownMax: 30,
      enemyShootTimer: 0,
      enemyShootInterval: 60,
      levelTransition: false,
      levelTransitionTimer: 0,
    };

    const player = {
      x: CANVAS_WIDTH / 2 - 20,
      y: CANVAS_HEIGHT - 80,
      width: 40,
      height: 30,
      speed: 6,
      color: "#0f0",
    };

    const bullets = [];
    const enemyBullets = [];
    const enemies = [];
    const barriers = [];

    const keys = {
      left: false,
      right: false,
      space: false,
      spacePressed: false,
    };

    function createEnemies() {
      enemies.length = 0;

      const baseRows = 3;
      const additionalRows = Math.min(Math.floor((gameState.level - 1) / 2), 2);
      const rows = baseRows + additionalRows;
      const cols = 10;
      const enemyWidth = 40;
      const enemyHeight = 30;
      const padding = 10;
      const offsetTop = 60;
      const offsetLeft = 100;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          enemies.push({
            x: offsetLeft + col * (enemyWidth + padding),
            y: offsetTop + row * (enemyHeight + padding),
            width: enemyWidth,
            height: enemyHeight,
            alive: true,
            color: row < 2 ? "#f00" : row < 4 ? "#ff0" : "#0ff",
          });
        }
      }
    }

    function createBarriers() {
      barriers.length = 0;

      if (gameState.level < 3) return;

      const barrierWidth = 80;
      const barrierHeight = 60;
      const numBarriers = 4;
      const spacing =
        (CANVAS_WIDTH - numBarriers * barrierWidth) / (numBarriers + 1);

      for (let i = 0; i < numBarriers; i++) {
        const barrier = {
          x: spacing + i * (barrierWidth + spacing),
          y: CANVAS_HEIGHT - 150,
          width: barrierWidth,
          height: barrierHeight,
          blocks: [],
        };

        const blockSize = 10;
        const blocksX = Math.floor(barrierWidth / blockSize);
        const blocksY = Math.floor(barrierHeight / blockSize);

        for (let by = 0; by < blocksY; by++) {
          for (let bx = 0; bx < blocksX; bx++) {
            if (by < blocksY - 2 || (bx > 1 && bx < blocksX - 2)) {
              barrier.blocks.push({
                x: bx * blockSize,
                y: by * blockSize,
                alive: true,
              });
            }
          }
        }

        barriers.push(barrier);
      }
    }

    function drawPlayer() {
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.closePath();
      ctx.fill();
    }

    function drawEnemies() {
      enemies.forEach((enemy) => {
        if (enemy.alive) {
          ctx.fillStyle = enemy.color;
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.strokeRect(enemy.x + 8, enemy.y + 5, 8, 8);
          ctx.strokeRect(enemy.x + 24, enemy.y + 5, 8, 8);
        }
      });
    }

    function drawBullets() {
      ctx.fillStyle = "#fff";
      bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });

      ctx.fillStyle = "#f00";
      enemyBullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
    }

    function drawBarriers() {
      barriers.forEach((barrier) => {
        barrier.blocks.forEach((block) => {
          if (block.alive) {
            ctx.fillStyle = "#0f0";
            ctx.fillRect(barrier.x + block.x, barrier.y + block.y, 10, 10);
          }
        });
      });
    }

    function drawUI() {
      if (gameState.paused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#0f0";
        ctx.font = "48px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = "24px Courier New";
        ctx.fillText(
          "Press P to Resume",
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 40,
        );
        return;
      }

      if (gameState.levelTransition) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#0f0";
        ctx.font = "48px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(
          `Level ${gameState.level - 1} Complete!`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 - 40,
        );
        ctx.font = "24px Courier New";
        ctx.fillText(
          `Get Ready for Level ${gameState.level}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 20,
        );

        if (gameState.level === 4) {
          ctx.fillText(
            "Barriers Added!",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + 60,
          );
        } else if (gameState.level === 5) {
          ctx.fillText(
            "Fire Rate Increased!",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + 60,
          );
        } else if (gameState.level === 7) {
          ctx.fillText(
            "More Enemies!",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + 60,
          );
        }
        return;
      }

      if (gameState.status === "gameover") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#f00";
        ctx.font = "48px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = "24px Courier New";
        ctx.fillStyle = "#fff";
        ctx.fillText(
          `Final Score: ${gameState.score}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 20,
        );
        ctx.fillText(
          `Level Reached: ${gameState.level}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 50,
        );
      } else if (gameState.status === "win") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#0f0";
        ctx.font = "48px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("VICTORY!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
        ctx.font = "32px Courier New";
        ctx.fillText(
          `All ${MAX_LEVEL} Levels Complete!`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 10,
        );
        ctx.font = "24px Courier New";
        ctx.fillStyle = "#fff";
        ctx.fillText(
          `Final Score: ${gameState.score}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 50,
        );
      }
    }

    function updatePlayer() {
      if (keys.left && player.x > 0) {
        player.x -= player.speed;
      }
      if (keys.right && player.x < CANVAS_WIDTH - player.width) {
        player.x += player.speed;
      }

      if (gameState.shootCooldown > 0) {
        gameState.shootCooldown--;
      }

      if (keys.space && !keys.spacePressed && gameState.shootCooldown === 0) {
        bullets.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 10,
          speed: 7,
        });
        keys.spacePressed = true;

        const cooldownReduction = Math.floor((gameState.level - 1) / 3) * 5;
        gameState.shootCooldown = Math.max(
          10,
          gameState.shootCooldownMax - cooldownReduction,
        );
      }
    }

    function updateBullets() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;

        if (bullets[i].y < 0) {
          bullets.splice(i, 1);
        }
      }

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBullets[i].speed;

        if (enemyBullets[i].y > CANVAS_HEIGHT) {
          enemyBullets.splice(i, 1);
        }
      }
    }

    function updateEnemyShooting() {
      gameState.enemyShootTimer--;

      if (gameState.enemyShootTimer <= 0) {
        const aliveEnemies = enemies.filter((e) => e.alive);
        if (aliveEnemies.length > 0) {
          const shooter =
            aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

          enemyBullets.push({
            x: shooter.x + shooter.width / 2 - 2,
            y: shooter.y + shooter.height,
            width: 4,
            height: 10,
            speed: 4,
          });
        }

        const intervalReduction = Math.floor((gameState.level - 1) / 2) * 10;
        gameState.enemyShootTimer = Math.max(
          30,
          gameState.enemyShootInterval - intervalReduction,
        );
      }
    }

    function updateEnemies() {
      let shouldDrop = false;
      const speedMultiplier = 1 + (gameState.level - 1) * 0.2;
      const currentSpeed = gameState.enemySpeed * speedMultiplier;

      enemies.forEach((enemy) => {
        if (enemy.alive) {
          enemy.x += currentSpeed * gameState.enemyDirection;

          if (enemy.x <= 0 || enemy.x + enemy.width >= CANVAS_WIDTH) {
            shouldDrop = true;
          }
        }
      });

      if (shouldDrop) {
        gameState.enemyDirection *= -1;
        enemies.forEach((enemy) => {
          if (enemy.alive) {
            enemy.y += gameState.enemyDropDistance;
          }
        });
      }

      const aliveEnemies = enemies.filter((e) => e.alive).length;
      if (aliveEnemies < 20) {
        gameState.enemySpeed = 0.7;
      }
      if (aliveEnemies < 10) {
        gameState.enemySpeed = 0.9;
      }
      if (aliveEnemies < 5) {
        gameState.enemySpeed = 1.2;
      }
    }

    function checkCollisions() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        let bulletDestroyed = false;

        for (let j = 0; j < enemies.length; j++) {
          const enemy = enemies[j];

          if (
            enemy.alive &&
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            enemy.alive = false;
            bullets.splice(i, 1);
            bulletDestroyed = true;
            gameState.score += 10 + gameState.level * 5;
            updateScoreDisplay();
            break;
          }
        }

        if (bulletDestroyed) continue;

        for (let b = 0; b < barriers.length; b++) {
          const barrier = barriers[b];
          for (let block = barrier.blocks.length - 1; block >= 0; block--) {
            const blockData = barrier.blocks[block];
            if (blockData.alive) {
              const blockX = barrier.x + blockData.x;
              const blockY = barrier.y + blockData.y;

              if (
                bullet.x < blockX + 10 &&
                bullet.x + bullet.width > blockX &&
                bullet.y < blockY + 10 &&
                bullet.y + bullet.height > blockY
              ) {
                blockData.alive = false;
                bullets.splice(i, 1);
                bulletDestroyed = true;
                break;
              }
            }
          }
          if (bulletDestroyed) break;
        }
      }

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        let bulletDestroyed = false;

        if (
          bullet.x < player.x + player.width &&
          bullet.x + bullet.width > player.x &&
          bullet.y < player.y + player.height &&
          bullet.y + bullet.height > player.y
        ) {
          enemyBullets.splice(i, 1);
          loseLife();
          bulletDestroyed = true;
          continue;
        }

        for (let b = 0; b < barriers.length; b++) {
          const barrier = barriers[b];
          for (let block = barrier.blocks.length - 1; block >= 0; block--) {
            const blockData = barrier.blocks[block];
            if (blockData.alive) {
              const blockX = barrier.x + blockData.x;
              const blockY = barrier.y + blockData.y;

              if (
                bullet.x < blockX + 10 &&
                bullet.x + bullet.width > blockX &&
                bullet.y < blockY + 10 &&
                bullet.y + bullet.height > blockY
              ) {
                blockData.alive = false;
                enemyBullets.splice(i, 1);
                bulletDestroyed = true;
                break;
              }
            }
          }
          if (bulletDestroyed) break;
        }
      }

      enemies.forEach((enemy) => {
        if (
          enemy.alive &&
          enemy.x < player.x + player.width &&
          enemy.x + enemy.width > player.x &&
          enemy.y < player.y + player.height &&
          enemy.y + enemy.height > player.y
        ) {
          loseLife();
        }
      });

      const aliveEnemies = enemies.filter((e) => e.alive).length;
      if (aliveEnemies === 0) {
        nextLevel();
      }
    }

    function loseLife() {
      gameState.lives--;
      updateLivesDisplay();

      if (gameState.lives <= 0) {
        gameState.status = "gameover";
      } else {
        player.x = CANVAS_WIDTH / 2 - 20;
        player.y = CANVAS_HEIGHT - 80;
        enemyBullets.length = 0;
        enemies.forEach((enemy) => {
          if (enemy.alive) {
            enemy.y = Math.max(60, enemy.y - 50);
          }
        });
      }
    }

    function nextLevel() {
      if (gameState.level >= MAX_LEVEL) {
        gameState.status = "win";
        return;
      }

      gameState.level++;
      gameState.levelTransition = true;
      gameState.levelTransitionTimer = 120;

      updateLevelDisplay();
    }

    function startNextLevel() {
      gameState.levelTransition = false;
      gameState.enemySpeed = 0.5;
      gameState.enemyDirection = 1;

      player.x = CANVAS_WIDTH / 2 - 20;
      player.y = CANVAS_HEIGHT - 80;

      bullets.length = 0;
      enemyBullets.length = 0;

      createEnemies();
      createBarriers();
    }

    function update() {
      if (gameState.status !== "playing" || gameState.paused) return;

      if (gameState.levelTransition) {
        gameState.levelTransitionTimer--;
        if (gameState.levelTransitionTimer <= 0) {
          startNextLevel();
        }
        return;
      }

      updatePlayer();
      updateBullets();
      updateEnemies();
      updateEnemyShooting();
      checkCollisions();
    }

    function render() {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawPlayer();
      drawEnemies();
      drawBullets();
      drawBarriers();
      drawUI();
    }

    function gameLoop() {
      update();
      render();
      requestAnimationFrame(gameLoop);
    }

    function handleKeyDown(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keys.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keys.right = true;
      }
      if (e.key === " ") {
        e.preventDefault();
        keys.space = true;
      }
      if (e.key === "p" || e.key === "P") {
        togglePause();
      }
      if (e.key === "r" || e.key === "R") {
        if (gameState.status === "gameover" || gameState.status === "win") {
          resetGame();
        }
      }
    }

    function handleKeyUp(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keys.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keys.right = false;
      }
      if (e.key === " ") {
        keys.space = false;
        keys.spacePressed = false;
      }
    }

    function togglePause() {
      if (gameState.status === "playing" && !gameState.levelTransition) {
        gameState.paused = !gameState.paused;
        updatePauseButton();
      }
    }

    function updatePauseButton() {
      const pauseBtn = document.getElementById("pause-btn");
      if (pauseBtn) {
        pauseBtn.textContent = gameState.paused ? "Resume" : "Pause";
      }
    }

    function updateScoreDisplay() {
      const scoreDisplay = document.getElementById("score-display");
      if (scoreDisplay) {
        scoreDisplay.textContent = gameState.score;
      }
    }

    function updateLevelDisplay() {
      const levelDisplay = document.getElementById("level-display");
      if (levelDisplay) {
        levelDisplay.textContent = gameState.level;
      }
    }

    function updateLivesDisplay() {
      const livesDisplay = document.getElementById("lives-display");
      if (livesDisplay) {
        livesDisplay.textContent = gameState.lives;
      }
    }

    function resetGame() {
      gameState.status = "playing";
      gameState.score = 0;
      gameState.level = 1;
      gameState.lives = 3;
      gameState.paused = false;
      gameState.enemySpeed = 0.5;
      gameState.enemyDirection = 1;
      gameState.shootCooldown = 0;
      gameState.enemyShootTimer = 0;
      gameState.levelTransition = false;

      player.x = CANVAS_WIDTH / 2 - 20;
      player.y = CANVAS_HEIGHT - 80;

      bullets.length = 0;
      enemyBullets.length = 0;
      enemies.length = 0;
      barriers.length = 0;

      createEnemies();
      createBarriers();

      updateScoreDisplay();
      updateLevelDisplay();
      updateLivesDisplay();
      updatePauseButton();
    }

    function goBackToArcade() {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ action: "backToArcade" }, "*");
      }
    }

    function init() {
      createEnemies();
      createBarriers();

      const backBtn = document.getElementById("back-btn");
      const pauseBtn = document.getElementById("pause-btn");
      const restartBtn = document.getElementById("restart-btn");

      if (backBtn) {
        backBtn.addEventListener("click", goBackToArcade);
      }
      if (pauseBtn) {
        pauseBtn.addEventListener("click", togglePause);
      }
      if (restartBtn) {
        restartBtn.addEventListener("click", resetGame);
      }

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      updateScoreDisplay();
      updateLevelDisplay();
      updateLivesDisplay();

      gameLoop();
    }

    init();

    return {
      reset: resetGame,
      destroy: () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      },
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = initSpaceInvaders;
  } else {
    window.initSpaceInvaders = initSpaceInvaders;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.querySelector(".game-wrapper")) {
        initSpaceInvaders();
      }
    });
  } else {
    if (document.querySelector(".game-wrapper")) {
      initSpaceInvaders();
    }
  }
})();
