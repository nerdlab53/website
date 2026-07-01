import {PAL, PAL_HEX, pxText} from "../palette.js";

// Generate a tiny pixel Jirachi once: gold 5-point star head (point up),
// teal eye-band with navy eyes, a cream belly "third eye", and the two wish
// ribbons/tags streaming from the sides.
export function makeJirachiTexture(scene) {
    if (scene.textures.exists('jirachi')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const cx = 17, cy = 11, spikes = 5, outer = 10, inner = 4.6;
    const pts = [];
    for (let i = 0; i < spikes * 2; i++) {
        const r = (i % 2 === 0) ? outer : inner;
        const a = (Math.PI / spikes) * i - Math.PI / 2;   // one point straight up
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    // ribbons / wish tags (drawn behind the body)
    g.fillStyle(0xd4af2f, 1);
    g.fillRect(2, cy + 1, 8, 2); g.fillRect(2, cy - 1, 2, 6); g.fillRect(4, cy + 3, 2, 4);      // left
    g.fillRect(24, cy + 1, 8, 2); g.fillRect(30, cy - 1, 2, 6); g.fillRect(28, cy + 3, 2, 4);   // right
    // star body
    g.fillStyle(PAL.gold, 1); g.fillPoints(pts, true);
    g.lineStyle(1, 0xc9a52c, 1); g.strokePoints(pts, true);
    // teal eye-band
    g.fillStyle(PAL.mint, 1); g.fillRect(cx - 6, cy - 1, 12, 3);
    // navy eyes
    g.fillStyle(PAL.navy, 1); g.fillRect(cx - 4, cy, 2, 2); g.fillRect(cx + 2, cy, 2, 2);
    // little mouth + cream belly third-eye
    g.fillRect(cx - 1, cy + 4, 2, 1);
    g.fillStyle(PAL.cream, 1); g.fillRect(cx - 1, cy + 6, 2, 2);
    g.generateTexture('jirachi', 34, 22);
    scene.textures.get('jirachi').setFilter(Phaser.Textures.FilterMode.NEAREST);
    g.destroy();
}

// Jirachi hovers and trails one "tile" behind the player, with a bob + sparkle.
export class Jirachi {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.cont = scene.add.container(player.x - 18, player.y - 28).setDepth(6);
        this.spr = scene.add.sprite(0, 0, 'jirachi').setScale(0.8);
        this.cont.add(this.spr);
        scene.tweens.add({ targets: this.spr, y: -4, duration: 900, yoyo: true,
            repeat: -1, ease: 'Sine.easeInOut' });
        this.history = [];
        this.sparkleT = 0;
    }

    update(time, delta) {
        this.history.push({ x: this.player.x, y: this.player.y });
        if (this.history.length > 22) this.history.shift();     // ~1-tile trailing lag
        const t = this.history[0];
        const tx = t.x - 16, ty = t.y - 30;                     // float above-left of trail point
        this.cont.x += (tx - this.cont.x) * 0.15;
        this.cont.y += (ty - this.cont.y) * 0.15;

        this.sparkleT -= delta;
        if (this.sparkleT <= 0) {
            this.sparkleT = 220;
            const s = this.scene.add.image(this.cont.x + (Math.random() * 8 - 4),
                this.cont.y + 8, 'jirachi').setScale(0.35).setDepth(5).setTint(PAL.cream);
            this.scene.tweens.add({ targets: s, alpha: 0, y: '+=10', scale: 0.1,
                duration: 600, onComplete: () => s.destroy() });
        }
    }
}

// Bottom dialogue box for Jirachi's guidance (fixed to the camera). The box is
// rebuilt each time, sized to fit the text (Rectangle.setSize doesn't reliably
// update the fill, so we recreate the panels instead of resizing placeholders).
export class GuideBox {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        this.rect = null;
        this.inner = null;
        this.face = scene.add.sprite(0, 0, 'jirachi').setScrollFactor(0)
            .setScale(1.0).setDepth(202).setVisible(false);
        this.txt = pxText(scene, 0, 0, '', 8, PAL_HEX.navy)
            .setScrollFactor(0).setDepth(202).setVisible(false);
        this.hint = pxText(scene, 0, 0, '[ENTER]', 6, PAL_HEX.amber)
            .setOrigin(1, 1).setScrollFactor(0).setDepth(202).setVisible(false);

        scene.input.keyboard.on('keydown-ENTER', () => this.hide());
        scene.input.keyboard.on('keydown-SPACE', () => this.hide());
        scene.input.on('pointerdown', () => { if (this.visible && !window.mouseOverMenu) this.hide(); });
    }

    show(text) {
        this.txt.setText(text);
        const sw = this.scene.scale.width, sh = this.scene.scale.height;
        const faceW = 30, padX = 12, padY = 8;
        const bw = Math.min(this.txt.width + faceW + padX * 3, sw - 8);
        const bh = this.txt.height + padY * 2 + 12;   // extra row for the [ENTER] hint
        const bx = sw / 2, by = sh - 8;

        if (this.rect) this.rect.destroy();
        if (this.inner) this.inner.destroy();
        this.rect = this.scene.add.rectangle(bx, by, bw, bh, PAL.cream)
            .setScrollFactor(0).setOrigin(0.5, 1).setStrokeStyle(3, PAL.gold).setDepth(200);
        this.inner = this.scene.add.rectangle(bx, by - 3, bw - 6, bh - 6)
            .setScrollFactor(0).setOrigin(0.5, 1).setStrokeStyle(1, PAL.mint).setDepth(200).setFillStyle();

        this.face.setPosition(bx - bw / 2 + padX + 8, by - bh / 2).setVisible(true);
        this.txt.setPosition(bx - bw / 2 + padX + faceW, by - bh + padY).setVisible(true);
        this.hint.setPosition(bx + bw / 2 - 8, by - 6).setVisible(true);
        this.visible = true;
        this.scene.guideOpen = true;
    }

    hide() {
        if (!this.visible) return;
        if (this.rect) { this.rect.destroy(); this.rect = null; }
        if (this.inner) { this.inner.destroy(); this.inner = null; }
        this.face.setVisible(false);
        this.txt.setVisible(false);
        this.hint.setVisible(false);
        this.visible = false;
        this.scene.guideOpen = false;
    }
}
