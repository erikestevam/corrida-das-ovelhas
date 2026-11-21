import Phaser from 'phaser';

export class AssetGenerator {
  /**
   * Generates all procedural vector textures directly into Phaser's Texture Manager
   */
  public static generateAll(scene: Phaser.Scene): void {
    this.createShepherd(scene);
    this.createShepherdJump(scene);
    this.createSheep(scene);
    this.createStar(scene);
    this.createSurpriseBox(scene);
    this.createTurboRamp(scene);
    this.createRock(scene);
    this.createBush(scene);
    this.createPuddle(scene);
    this.createCloud(scene);
    this.createSun(scene);
    this.createRainbow(scene);
    this.createSparkle(scene);
    this.createGround(scene);
    this.createHills(scene);
  }

  private static createShepherd(scene: Phaser.Scene): void {
    const w = 72;
    const h = 90;
    const canvas = scene.textures.createCanvas('shepherd', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(36, 86, 24, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / cute boots
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.roundRect(24, 70, 10, 16, 5);
    ctx.roundRect(40, 70, 10, 16, 5);
    ctx.fill();

    // Tunic (Blue with golden trim)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(22, 48);
    ctx.lineTo(52, 48);
    ctx.lineTo(58, 73);
    ctx.lineTo(16, 73);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0369a1';
    ctx.stroke();

    // Golden belt / sash
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(19, 58, 36, 6);

    // Shepherd's Crook (Wooden golden staff)
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(56, 78);
    ctx.lineTo(56, 32);
    ctx.arc(50, 32, 6, 0, Math.PI, true);
    ctx.stroke();

    // Hands
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(20, 56, 5, 0, Math.PI * 2);
    ctx.arc(54, 54, 5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(37, 34, 16, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = '#f472b6';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(28, 37, 4, 0, Math.PI * 2);
    ctx.arc(46, 37, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Big Joyful Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(31, 31, 3, 0, Math.PI * 2);
    ctx.arc(43, 31, 3, 0, Math.PI * 2);
    ctx.fill();
    // Catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(32, 30, 1.2, 0, Math.PI * 2);
    ctx.arc(44, 30, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Smiling Mouth
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(37, 37, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Cheerful curly hair
    ctx.fillStyle = '#78350f';
    const hairCurls = [
      { x: 24, y: 22, r: 8 },
      { x: 33, y: 18, r: 9 },
      { x: 43, y: 18, r: 9 },
      { x: 50, y: 23, r: 8 },
      { x: 21, y: 30, r: 7 },
      { x: 52, y: 30, r: 7 }
    ];
    hairCurls.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas.refresh();
  }

  private static createShepherdJump(scene: Phaser.Scene): void {
    const w = 72;
    const h = 90;
    const canvas = scene.textures.createCanvas('shepherd-jump', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Jump pose: feet tucked up happily, crook held high
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.roundRect(22, 60, 12, 12, 5);
    ctx.roundRect(42, 60, 12, 12, 5);
    ctx.fill();

    // Flared tunic
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(22, 40);
    ctx.lineTo(52, 40);
    ctx.lineTo(60, 62);
    ctx.lineTo(14, 62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Belt
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(18, 48, 38, 6);

    // Shepherd's Crook raised high
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(54, 52);
    ctx.lineTo(60, 14);
    ctx.arc(54, 14, 6, 0, Math.PI, true);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(37, 26, 16, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = '#f472b6';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(28, 29, 4, 0, Math.PI * 2);
    ctx.arc(46, 29, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Smiling closed joyful eyes (happy arc ^ ^)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(30, 24, 4, Math.PI, 0);
    ctx.arc(44, 24, 4, Math.PI, 0);
    ctx.stroke();

    // Big happy open mouth
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(37, 29, 6, 0, Math.PI);
    ctx.fill();

    // Hair curls
    ctx.fillStyle = '#78350f';
    const curls = [
      { x: 24, y: 15, r: 8 },
      { x: 33, y: 11, r: 9 },
      { x: 43, y: 11, r: 9 },
      { x: 50, y: 16, r: 8 },
      { x: 21, y: 22, r: 7 },
      { x: 52, y: 22, r: 7 }
    ];
    curls.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas.refresh();
  }

  private static createSheep(scene: Phaser.Scene): void {
    const w = 70;
    const h = 60;
    const canvas = scene.textures.createCanvas('sheep', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(35, 56, 22, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Little cute black legs
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(22, 44, 6, 12, 3);
    ctx.roundRect(42, 44, 6, 12, 3);
    ctx.fill();

    // Fluffy cloud body (overlapping circles)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;

    const puffs = [
      { x: 24, y: 34, r: 14 },
      { x: 46, y: 34, r: 14 },
      { x: 35, y: 24, r: 15 },
      { x: 28, y: 44, r: 12 },
      { x: 42, y: 44, r: 12 },
      { x: 35, y: 35, r: 16 }
    ];

    puffs.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Head
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.ellipse(35, 34, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbcfe8';
    ctx.stroke();

    // Pink Ears
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(22, 30, 6, 3, -0.4, 0, Math.PI * 2);
    ctx.ellipse(48, 30, 6, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = '#f472b6';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(28, 36, 3, 0, Math.PI * 2);
    ctx.arc(42, 36, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Smiling Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(30, 32, 2.5, 0, Math.PI * 2);
    ctx.arc(40, 32, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(31, 31, 1, 0, Math.PI * 2);
    ctx.arc(41, 31, 1, 0, Math.PI * 2);
    ctx.fill();

    // Cute smiling mouth
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(35, 37, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    canvas.refresh();
  }

  private static createStar(scene: Phaser.Scene): void {
    const size = 48;
    const canvas = scene.textures.createCanvas('star', size, size);
    if (!canvas) return;
    const ctx = canvas.getContext();

    const cx = size / 2;
    const cy = size / 2;
    const spikes = 5;
    const outerRadius = 20;
    const innerRadius = 10;

    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    // Outer glow
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute Star face
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(cx - 5, cy, 2, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    canvas.refresh();
  }

  private static createSurpriseBox(scene: Phaser.Scene): void {
    const size = 56;
    const canvas = scene.textures.createCanvas('box-question', size, size);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Glowing Box Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#fde047');
    grad.addColorStop(1, '#eab308');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(4, 4, size - 8, size - 8, 12);
    ctx.fill();
    ctx.stroke();

    // Corner rivets
    ctx.fillStyle = '#a16207';
    const rivets = [
      { x: 10, y: 10 },
      { x: size - 10, y: 10 },
      { x: 10, y: size - 10 },
      { x: size - 10, y: size - 10 }
    ];
    rivets.forEach(r => {
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // White bold Question Mark '?'
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 3;
    ctx.font = 'bold 32px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('?', size / 2, size / 2 + 2);
    ctx.fillText('?', size / 2, size / 2 + 2);

    canvas.refresh();
  }

  private static createTurboRamp(scene: Phaser.Scene): void {
    const w = 90;
    const h = 44;
    const canvas = scene.textures.createCanvas('turbo-ramp', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Curved rainbow ramp pad
    const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    const bandHeight = (h - 10) / rainbowColors.length;

    rainbowColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(8, h - 6 - i * bandHeight);
      ctx.lineTo(w - 6, h - 16 - i * bandHeight);
      ctx.lineTo(w - 6, h - 16 - (i + 1) * bandHeight);
      ctx.lineTo(8, h - 6 - (i + 1) * bandHeight);
      ctx.closePath();
      ctx.fill();
    });

    // Glowing border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, h - 6);
    ctx.lineTo(w - 6, h - 16);
    ctx.lineTo(w - 6, 8);
    ctx.lineTo(8, 18);
    ctx.closePath();
    ctx.stroke();

    // Chevrons >> (Forward turbo arrows)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ ❯❯', w / 2, h / 2);

    canvas.refresh();
  }

  private static createRock(scene: Phaser.Scene): void {
    const w = 54;
    const h = 42;
    const canvas = scene.textures.createCanvas('rock', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Soft cartoon pebble/rock
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(27, 26, 22, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Friendly sleepy eyes (^ ^)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(21, 25, 3, Math.PI, 0);
    ctx.arc(33, 25, 3, Math.PI, 0);
    ctx.stroke();

    // Moss tuft on top
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(27, 14, 5, 0, Math.PI * 2);
    ctx.arc(32, 15, 4, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  private static createBush(scene: Phaser.Scene): void {
    const w = 56;
    const h = 44;
    const canvas = scene.textures.createCanvas('bush', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Bouncy fluffy bush
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;

    const circles = [
      { x: 18, y: 26, r: 14 },
      { x: 38, y: 26, r: 14 },
      { x: 28, y: 18, r: 15 }
    ];
    circles.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Cute pink berries
    ctx.fillStyle = '#ec4899';
    const berries = [{ x: 22, y: 18 }, { x: 35, y: 20 }, { x: 28, y: 28 }];
    berries.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas.refresh();
  }

  private static createPuddle(scene: Phaser.Scene): void {
    const w = 64;
    const h = 26;
    const canvas = scene.textures.createCanvas('puddle', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Shiny cartoon water puddle
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(32, 13, 28, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Water shine reflection
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(26, 11, 14, 3, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    canvas.refresh();
  }

  private static createCloud(scene: Phaser.Scene): void {
    const w = 120;
    const h = 60;
    const canvas = scene.textures.createCanvas('cloud', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    const puffs = [
      { x: 35, y: 36, r: 22 },
      { x: 60, y: 28, r: 26 },
      { x: 85, y: 36, r: 20 },
      { x: 50, y: 44, r: 18 },
      { x: 70, y: 44, r: 18 }
    ];
    puffs.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas.refresh();
  }

  private static createSun(scene: Phaser.Scene): void {
    const size = 100;
    const canvas = scene.textures.createCanvas('sun', size, size);
    if (!canvas) return;
    const ctx = canvas.getContext();

    const cx = size / 2;
    const cy = size / 2;

    // Sun rays
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rx = cx + Math.cos(angle) * 36;
      const ry = cy + Math.sin(angle) * 36;
      ctx.beginPath();
      ctx.arc(rx, ry, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Main Face
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rosy Cheeks
    ctx.fillStyle = '#f472b6';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(cx - 14, cy + 4, 5, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Smiling Eyes
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 4, 3, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Big happy smile
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();

    canvas.refresh();
  }

  private static createRainbow(scene: Phaser.Scene): void {
    const w = 400;
    const h = 200;
    const canvas = scene.textures.createCanvas('rainbow', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a855f7'];
    const cx = w / 2;
    const cy = h;
    const radiusBase = 160;
    const bandWidth = 8;

    colors.forEach((c, idx) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = bandWidth;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusBase - idx * bandWidth, Math.PI, 0, false);
      ctx.stroke();
    });

    canvas.refresh();
  }

  private static createSparkle(scene: Phaser.Scene): void {
    const size = 20;
    const canvas = scene.textures.createCanvas('sparkle', size, size);
    if (!canvas) return;
    const ctx = canvas.getContext();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(13, 7);
    ctx.lineTo(20, 10);
    ctx.lineTo(13, 13);
    ctx.lineTo(10, 20);
    ctx.lineTo(7, 13);
    ctx.lineTo(0, 10);
    ctx.lineTo(7, 7);
    ctx.closePath();
    ctx.fill();

    canvas.refresh();
  }

  private static createGround(scene: Phaser.Scene): void {
    const w = 128;
    const h = 128;
    const canvas = scene.textures.createCanvas('ground', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    // Dirt base
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, 24, w, h - 24);

    // Darker dirt texture specks
    ctx.fillStyle = '#713f12';
    for (let i = 0; i < 30; i++) {
      const rx = (i * 29) % w;
      const ry = 30 + ((i * 37) % (h - 38));
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lush Grass Top Layer
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 6, w, 22);

    // Light grass fringe
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, w, 8);

    // Decorative Grass Blades
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 28);
      ctx.lineTo(x + 8, 36);
      ctx.lineTo(x + 16, 28);
      ctx.fill();
    }

    // Cute daisies
    const daisy = (dx: number, dy: number) => {
      ctx.fillStyle = '#ffffff';
      for (let j = 0; j < 5; j++) {
        const ang = (j * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(dx + Math.cos(ang) * 4, dy + Math.sin(ang) * 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    daisy(24, 14);
    daisy(88, 16);

    canvas.refresh();
  }

  private static createHills(scene: Phaser.Scene): void {
    // 3 Parallax Layers: back, mid, fore
    const w = 512;
    const h = 160;

    // 1. Back Hills (Soft pastel blue/green)
    const c1 = scene.textures.createCanvas('hill-back', w, h);
    if (c1) {
      const ctx = c1.getContext();
      ctx.fillStyle = '#93c5fd';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.bezierCurveTo(w * 0.25, 40, w * 0.75, 40, w, h);
      ctx.fill();
      c1.refresh();
    }

    // 2. Mid Hills (Gentle lime green with trees)
    const c2 = scene.textures.createCanvas('hill-mid', w, h);
    if (c2) {
      const ctx = c2.getContext();
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.bezierCurveTo(w * 0.3, 60, w * 0.7, 70, w, h);
      ctx.fill();

      // Little cute round trees
      ctx.fillStyle = '#16a34a';
      const tree = (tx: number, ty: number) => {
        ctx.beginPath();
        ctx.arc(tx, ty, 14, 0, Math.PI * 2);
        ctx.fill();
      };
      tree(120, 100);
      tree(340, 110);
      c2.refresh();
    }

    // 3. Fore Hills (Vibrant bright grass)
    const c3 = scene.textures.createCanvas('hill-fore', w, h);
    if (c3) {
      const ctx = c3.getContext();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.bezierCurveTo(w * 0.4, 80, w * 0.8, 90, w, h);
      ctx.fill();
      c3.refresh();
    }
  }
}
