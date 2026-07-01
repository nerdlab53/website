import {PAL, PAL_HEX, pxText} from "../palette.js";

// The main info panels (About / Projects / Skills / welcome). The interactive
// spot stays in the world (the glowing purple tiles), but the text is shown as
// a screen-centred panel so it stays on-screen and readable at any camera zoom.
export class BigSign extends Phaser.GameObjects.Zone
{
	constructor(scene, x, y, width, height, signX, signY, sm_signX, sm_signY, text) {
		super(scene, x, y, width, height);

		scene.add.existing(this).setOrigin(0, 1);
		scene.physics.world.enable(this, 1);  // 1 is for static body
		scene.physics.add.overlap(scene.player, this, () => this.showSignText(scene.player));

		// Screen-centred panel (fixed to the camera), sized to the text.
		this.panelText = pxText(scene, 0, 0, text, 8, PAL_HEX.navy, 'center')
			.setOrigin(0.5, 0.5).setDepth(201).setScrollFactor(0).setVisible(false);
		this.panelRect = scene.add.rectangle(0, 0, this.panelText.width + 24, this.panelText.height + 20, PAL.cream)
			.setStrokeStyle(3, PAL.gold).setOrigin(0.5, 0.5).setDepth(200).setScrollFactor(0).setVisible(false);
		this.panelInner = scene.add.rectangle(0, 0, this.panelText.width + 14, this.panelText.height + 10)
			.setStrokeStyle(1, PAL.mint).setOrigin(0.5, 0.5).setDepth(200).setScrollFactor(0).setFillStyle().setVisible(false);

		// Glowing purple interaction tiles (kept in the world)
		scene.anims.create({
			key: "purple-tile-anim",
			frames: scene.anims.generateFrameNames("anims_ui", { prefix: "purple.", start: 0, end: 2, zeroPad: 3 }),
			frameRate: 6, yoyo: true, delay: 400, repeatDelay: 800, repeat: -1
		});
		this.purple_tiles = [];
		if (scene.scene.key === 'ResearchScene') {
			this.purple_tiles.push(scene.add.sprite(x - 30, y - 10, "anims_ui", "purple.000").setOrigin(0, 1));
		} else {
			this.purple_tiles.push(scene.add.sprite(x - 8, y, "anims_ui", "purple.000").setOrigin(0, 1));
			if (height > 32) {
				this.purple_tiles.push(scene.add.sprite(x - 8, y - 32, "anims_ui", "purple.000").setOrigin(0, 1));
				this.purple_tiles.push(scene.add.sprite(x - 8 + 32, y, "anims_ui", "purple.000").setOrigin(0, 1));
				this.purple_tiles.push(scene.add.sprite(x - 8 + 32, y - 32, "anims_ui", "purple.000").setOrigin(0, 1));
			}
		}
		this.purple_tiles.forEach((t) => t.setDepth(2).play("purple-tile-anim", true));

		this.activated = false;
	}

	showSignText(player) {
		if (this.scene.guideOpen) return;   // don't clash with Jirachi's guide box
		if (Math.ceil(player.y + 20) <= this.y) {
			const cx = this.scene.scale.width / 2, cy = this.scene.scale.height / 2;
			this.panelRect.setPosition(cx, cy).setVisible(true);
			this.panelInner.setPosition(cx, cy).setVisible(true);
			this.panelText.setPosition(cx, cy).setVisible(true);
			this.purple_tiles.forEach((t) => t.anims.stop().setTint(0xffff00));
			this.activated = true;
			if (this.scene.scene.key === 'OverworldScene' && player.body.velocity.x === 0 && player.body.velocity.y === 0) {
				player.anims.play("ariel-wave", true);
			}
		}
	}

	hideSignText(player) {
		if (this.activated) {
			if ((!player.body.embedded && player.body.touching.none) || Math.ceil(player.y + 20) > this.y) {
				this.panelRect.setVisible(false);
				this.panelInner.setVisible(false);
				this.panelText.setVisible(false);
				this.purple_tiles.forEach((t) => t.clearTint());
				this.activated = false;
			}
		}
	}
}
