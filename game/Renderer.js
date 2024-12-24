class Renderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = config;
  }

  render(gameState) {
    const bottomOffset = 0; // Distance from bottom of screen

    // Clear entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Sky background
    const skyGradient = this.ctx.createLinearGradient(
      0,
      0,
      0,
      this.canvas.height
    );
    skyGradient.addColorStop(0, "#87CEEB");
    skyGradient.addColorStop(1, "#E0F6FF");
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate fixed bottom position for game elements
    const gameAreaBottom = this.canvas.height - bottomOffset;

    // Background with fixed positioning
    this.drawMountains(gameState.sceneOffset, gameAreaBottom);
    this.drawClouds(gameState.sceneOffset);

    // Game elements
    this.ctx.save();
    this.ctx.translate(
      (this.canvas.width - this.config.canvasWidth) / 2 - gameState.sceneOffset,
      0
    );

    // Platforms at fixed bottom position
    this.drawPlatforms(gameState.platforms, gameState.sticks, gameAreaBottom);
    this.drawSticks(gameState.sticks, gameAreaBottom);
    this.drawHero(gameState.heroX, gameState.heroY, gameAreaBottom);

    this.ctx.restore();
  }

  drawMountains(sceneOffset, gameAreaBottom) {
    const mountainWidth = this.canvas.width;

    // Back mountains
    this.ctx.fillStyle = "#95C5DB";
    const backMountainOffset = (sceneOffset * 0.2) % mountainWidth;

    for (let i = -2; i <= 2; i++) {
      const baseX = i * mountainWidth - backMountainOffset;
      const startHeight = 40;

      this.ctx.beginPath();
      this.ctx.moveTo(baseX, gameAreaBottom - startHeight);

      // First peak
      this.ctx.lineTo(baseX + mountainWidth * 0.2, gameAreaBottom - 180);
      this.ctx.lineTo(baseX + mountainWidth * 0.4, gameAreaBottom - 100);

      // Second peak
      this.ctx.lineTo(baseX + mountainWidth * 0.69, gameAreaBottom - 200);
      this.ctx.lineTo(baseX + mountainWidth * 0.8, gameAreaBottom - 140);

      // Third peak
      this.ctx.lineTo(baseX + mountainWidth * 0.9, gameAreaBottom - 95);
      this.ctx.lineTo(baseX + mountainWidth * 1, gameAreaBottom - 150);

      // Fourth peak
      this.ctx.lineTo(baseX + mountainWidth * 1, gameAreaBottom - 150);
      this.ctx.lineTo(baseX + mountainWidth * 1.1, gameAreaBottom - 90);

      // End point matches next mountain's start point
      this.ctx.lineTo(baseX + mountainWidth, gameAreaBottom - startHeight);
      this.ctx.lineTo(baseX + mountainWidth, gameAreaBottom);
      this.ctx.lineTo(baseX, gameAreaBottom);
      this.ctx.fill();
    }

    // Front mountains
    this.ctx.fillStyle = "#75A5BB";
    const frontMountainOffset = (sceneOffset * 0.3) % mountainWidth;

    for (let i = -2; i <= 2; i++) {
      const baseX = i * mountainWidth - frontMountainOffset;
      const startHeight = 60;

      this.ctx.beginPath();
      this.ctx.moveTo(baseX, gameAreaBottom - startHeight);

      // First peak
      this.ctx.lineTo(baseX + mountainWidth * 0.12, gameAreaBottom - 140);
      this.ctx.lineTo(baseX + mountainWidth * 0.25, gameAreaBottom - 85);

      // Second peak
      this.ctx.lineTo(baseX + mountainWidth * 0.4, gameAreaBottom - 160);
      this.ctx.lineTo(baseX + mountainWidth * 0.5, gameAreaBottom - 100);

      // Third peak
      this.ctx.lineTo(baseX + mountainWidth * 0.7, gameAreaBottom - 140);
      this.ctx.lineTo(baseX + mountainWidth * 0.8, gameAreaBottom - 110);

      // Fourth peak
      this.ctx.lineTo(baseX + mountainWidth * 0.9, gameAreaBottom - 130);
      this.ctx.lineTo(baseX + mountainWidth * 1.1, gameAreaBottom - 80);

      // End point matches next mountain's start point
      this.ctx.lineTo(baseX + mountainWidth, gameAreaBottom - startHeight);
      this.ctx.lineTo(baseX + mountainWidth, gameAreaBottom);
      this.ctx.lineTo(baseX, gameAreaBottom);
      this.ctx.fill();
    }
  }

  drawClouds(sceneOffset) {
    this.ctx.fillStyle = "#FFFFFF";

    // cloud patterns
    const baseCloudPattern = [
      { x: 0.1, y: 100, size: 30, speed: 0.1, type: 1 },
      { x: 0.4, y: 150, size: 40, speed: 0.15, type: 2 },
      { x: 0.75, y: 160, size: 35, speed: 0.2, type: 3 },
      { x: 0.2, y: 180, size: 25, speed: 0.12, type: 2 },
      { x: 0.6, y: 210, size: 45, speed: 0.18, type: 1 },
      { x: 0.9, y: 100, size: 30, speed: 0.14, type: 3 },
    ];

    const patternWidth = this.canvas.width;
    baseCloudPattern.forEach((cloud) => {
      const cloudOffset = (sceneOffset * cloud.speed) % patternWidth;
      for (let i = -1; i <= 2; i++) {
        this.drawCloud(
          cloud.x * patternWidth - cloudOffset + patternWidth * i,
          cloud.y,
          cloud.size,
          cloud.type
        );
      }
    });
  }

  drawCloud(x, y, size, type) {
    const cloudGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
    cloudGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    cloudGradient.addColorStop(1, "rgba(255, 255, 255, 0.4)");
    this.ctx.fillStyle = cloudGradient;

    switch (type) {
      case 1: // small cloud
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(
          x - size * 0.4,
          y + size * 0.4,
          size * 0.7,
          0,
          Math.PI * 2
        );
        this.ctx.arc(
          x + size * 0.5,
          y + size * 0.4,
          size * 0.7,
          0,
          Math.PI * 2
        );
        break;

      case 2: // Wide cloud
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size, y, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.5, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(
          x + size * 0.5,
          y - size * 0.2,
          size * 0.7,
          0,
          Math.PI * 2
        );
        break;

      case 3: // Tall cloud
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
        this.ctx.arc(
          x + size * 0.2,
          y - size * 0.5,
          size * 0.8,
          0,
          Math.PI * 2
        );
        this.ctx.arc(
          x + size * 0.8,
          y + size * 0.5,
          size * 0.6,
          0,
          Math.PI * 2
        );
        this.ctx.arc(x + size * 1, y, size * 0.7, 0, Math.PI * 3);
        break;
    }
    this.ctx.fill();
  }

  drawPlatforms(platforms, sticks, gameAreaBottom) {
    platforms.forEach((platform) => {
      // Platform shadow
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      this.ctx.fillRect(
        platform.x + 5,
        gameAreaBottom - this.config.platformHeight + 5,
        platform.w,
        this.config.platformHeight
      );

      // Platform body
      this.ctx.fillStyle = "#4A4A4A";
      this.ctx.fillRect(
        platform.x,
        gameAreaBottom - this.config.platformHeight,
        platform.w,
        this.config.platformHeight
      );

      // Perfect area
      if (sticks[sticks.length - 1].x < platform.x) {
        this.ctx.fillStyle = "#FF4444";
        this.ctx.fillRect(
          platform.x + platform.w / 2 - this.config.perfectAreaSize / 2,
          gameAreaBottom - this.config.platformHeight,
          this.config.perfectAreaSize,
          this.config.perfectAreaSize
        );
      }
    });
  }

  drawSticks(sticks, gameAreaBottom) {
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 2;

    sticks.forEach((stick) => {
      this.ctx.save();
      this.ctx.translate(stick.x, gameAreaBottom - this.config.platformHeight);
      this.ctx.rotate((stick.rotation * Math.PI) / 180);

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, -stick.length);
      this.ctx.stroke();

      this.ctx.restore();
    });
  }

  // Draw the character
  drawHero(x, y, gameAreaBottom) {
    this.ctx.save();
    this.ctx.translate(
      x,
      gameAreaBottom -
        this.config.platformHeight -
        this.config.heroHeight / 2 +
        y
    );

    // Body
    this.ctx.fillStyle = "#333333";
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 15, 22, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(4, -7, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Pupil
    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    this.ctx.arc(5, -7, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Red band
    this.ctx.fillStyle = "#FF4444";
    this.ctx.fillRect(-12, -15, 24, 6);

    // Band tails
    this.ctx.beginPath();
    this.ctx.moveTo(12, -12);
    this.ctx.lineTo(22, -18);
    this.ctx.lineTo(19, -9);
    this.ctx.fill();

    // Legs
    this.ctx.fillStyle = "#333333";
    this.ctx.beginPath();
    this.ctx.arc(6, 20, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(-6, 20, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
