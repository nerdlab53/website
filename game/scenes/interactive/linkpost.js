import {PAL, PAL_HEX, pxText} from "../palette.js";

// A signpost the player can walk up to (or tap) to open an external link
// (GitHub, X, email, CV...). Shows a themed dialogue bubble on approach and a
// bobbing "!" cue so it reads as interactable. ENTER (while near) or a click
// opens the link in a new tab. Pushed into scene.signs so BaseScene.update
// hides it on movement, like a normal sign.
export class LinkPost extends Phaser.GameObjects.Zone {
    constructor(scene, x, y, text, url, label) {
        super(scene, x, y, 32, 32);
        scene.add.existing(this).setOrigin(0, 1);
        scene.physics.world.enable(this, 1); // static body -> player collides

        this.url = url;
        this.activated = false;
        const cx = Math.round(x) + 16, by = Math.round(y); // tile centre x, tile bottom y

        // --- signpost graphics (player depth is 5, so board sits behind player) ---
        scene.add.rectangle(cx, by - 2, 4, 14, 0x6b4a2b).setOrigin(0.5, 1).setDepth(4);      // post
        scene.add.rectangle(cx, by - 14, 26, 16, PAL.cream).setStrokeStyle(2, PAL.gold)
            .setOrigin(0.5, 1).setDepth(4);                                                   // board
        pxText(scene, cx, by - 27, label, 6, PAL_HEX.navy, 'center').setOrigin(0.5, 0)
            .setDepth(5);                                                                     // label

        // --- bobbing "!" cue ---
        this.cue = pxText(scene, cx, by - 34, '!', 12, PAL_HEX.gold).setOrigin(0.5, 1)
            .setDepth(103);
        scene.tweens.add({ targets: this.cue, y: by - 40, duration: 480, yoyo: true,
            repeat: -1, ease: 'Sine.easeInOut' });

        // --- dialogue bubble (hidden until approached) ---
        this.signText = pxText(scene, cx, by - 46, text, 8, PAL_HEX.navy, 'center')
            .setOrigin(0.5, 1).setDepth(101).setVisible(false);
        this.signRect = scene.add.rectangle(cx, by - 46, this.signText.width + 14,
            this.signText.height + 6, PAL.cream).setStrokeStyle(2, PAL.gold)
            .setOrigin(0.5, 1).setDepth(100).setVisible(false);

        scene.physics.add.collider(scene.player, this, () => this.activate());
        this.setInteractive().on('pointerdown', () => {
            window.mouseOverMenu = true; // don't also move the player
            this.open();
        });
    }

    activate() {
        if (this.activated) return;
        this.activated = true;
        this.signRect.setVisible(true);
        this.signText.setVisible(true);
        this.cue.setVisible(false);
        this.scene.showingSign = true;
        this.scene.activeLink = this;      // ENTER opens this one (see base.js)
    }

    open() {
        if (this.url) window.open(this.url, "_blank", "noopener");
    }

    // called by BaseScene.update when the player moves away
    playerMovement() { this.hideSignText(); }

    hideSignText() {
        if (!this.activated) return;
        this.activated = false;
        this.signRect.setVisible(false);
        this.signText.setVisible(false);
        this.cue.setVisible(true);
        this.scene.showingSign = false;
        if (this.scene.activeLink === this) this.scene.activeLink = null;
    }
}
