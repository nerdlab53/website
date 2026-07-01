import {OverworldScene} from "./scenes/overworld.js";
import {ResearchScene} from "./scenes/research.js";
import {UniversityScene} from "./scenes/university.js";
import {SoftwareScene} from "./scenes/software.js";

// ---------------------------------------------------------------------------
// GAME
const config = {
  // Canvas (not WebGL): deterministic pixel rendering with no bilinear blur on
  // every GPU. Readable text uses Phaser.Text in the Press Start 2P web font
  // (real fill color) rather than the opaque bitmap atlas, which can't be tinted
  // here. Plenty fast for a small tile game.
  type: Phaser.CANVAS,
  parent: "game-container",
  pixelArt: true,
  autoRound: true,
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: window.innerWidth,
    height: window.innerHeight
  },
  physics: {
    default: "arcade",
    arcade: { debug: false, gravity: { y: 0 } }
  },
  scene: [OverworldScene, ResearchScene, UniversityScene, SoftwareScene]
};

// Boot only after the Press Start 2P web font is ready, so text created at scene
// start (sign/linkpost labels) renders in the pixel font, not a fallback.
function boot() {
  const game = new Phaser.Game(config);
  window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
}

if (document.fonts && document.fonts.load) {
  document.fonts.load('16px "Press Start 2P"').then(boot, boot);
} else {
  boot();
}

// ---------------------------------------------------------------------------
// TOP-LEFT PICTURE + MENU (leave the game / jump to a site page)
// window.mouseOverMenu is read in base.js so clicking the menu doesn't move the player.
const pic = document.getElementById("pic-circ");
const menu = document.getElementById("game-menu");
window.mouseOverMenu = false;

document.addEventListener("pointerdown", (ev) => {
  window.mouseOverMenu = (ev.target === pic || ev.target === menu || ev.target.className === "game-menu-link");
});

pic.addEventListener("click", () => {
  menu.style.display = (menu.style.display === "none") ? "block" : "none";
});
