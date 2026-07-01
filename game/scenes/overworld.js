import {BaseScene} from "./base.js";
import './interactive/factory.js';  // This has to run before the first scene in order to add the commands
import {Jirachi, GuideBox, makeJirachiTexture} from './interactive/jirachi.js';


export class OverworldScene extends BaseScene {

  constructor() {
    super('OverworldScene');
  }

  preload() {
    // The keys have to be unique! Otherwise they will not be preloaded again.
    // this.load.image("OverworldTiles", "./assets/prod/tilesets_and_maps/tileset.png");
    this.load.image("TilesetImage", "./assets/prod/tilesets_and_maps/tileset_extruded.png");
    this.load.tilemapTiledJSON("OverworldMap", "./assets/prod/tilesets_and_maps/overworld-new.json");
    this.load.atlas("atlas", "./assets/prod/atlas/player.png", "./assets/prod/atlas/player.json");
    this.load.bitmapFont('pixelop', 'assets/prod/fonts/pixelop.png', 'assets/prod/fonts/pixelop.xml');
    this.load.atlas("anims_ui", "./assets/prod/atlas/anims_ui.png", "./assets/prod/atlas/anims_ui.json");
  }

  create() {
    super.create("OverworldMap");

    // Resize the world and camera bounds
    this.physics.world.setBounds(0, 0, 1920, 1088);
    this.cameras.main.setBounds(0, 0, 1920, 1088);

    // On scene switch (after entering a door) display the walking DOWN animation
    this.events.on('wake', () => {this.player.setTexture("atlas", "ariel-front")}, this);

    this.collide_with_world();  // Has to be called after the rest of the colliders are defined

    // ---- Jirachi guide companion ----
    makeJirachiTexture(this);
    this.guide = new GuideBox(this);
    this.jirachi = new Jirachi(this, this.player);

    // First-approach hints (once per session per key)
    this.seenHints = new Set();
    this.hints = [
      { x: 160,  y: 560, key: 'about',    text: "That's the Pokemon Center!\nStep inside for the trainer's story." },
      { x: 1584, y: 250, key: 'skills',   text: "The Gym! Skills are tested here -\ngo earn some badges inside." },
      { x: 1744, y: 820, key: 'projects', text: "The Poke Mart holds the projects.\nTake a look inside!" },
      { x: 288,  y: 544, key: 'posts',    text: "See the ! signposts? Walk up and\npress ENTER to connect elsewhere!" },
    ];

    // Intro plays once per browser session
    if (!window.__jirachiIntro) {
      window.__jirachiIntro = true;
      this.guide.show("Hi, I'm Jirachi! I'll help you explore.\nWalk into any building to see what's\ninside, or find the ! signposts to\nconnect with the trainer elsewhere!");
    }

    document.getElementById('loading').style.display = 'none';
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.jirachi) this.jirachi.update(time, delta);
    if (this.guide && !this.guide.visible) {
      for (const h of this.hints) {
        if (this.seenHints.has(h.key)) continue;
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, h.x, h.y) < 120) {
          this.seenHints.add(h.key);
          this.guide.show(h.text);
          break;
        }
      }
    }
  }

}
