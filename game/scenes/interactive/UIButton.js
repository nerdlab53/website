// License-safe background music: a tiny WebAudio chiptune (no asset files).
// ponytail: setInterval arpeggio, not a real sequencer - fine for a loop.
const Chiptune = {
  ctx: null, timer: null, step: 0, playing: false,
  notes: [523, 659, 784, 659, 587, 698, 880, 698, 523, 784, 659, 988, 880, 784, 659, 587],
  ensure() { if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) this.ctx = new A(); } },
  _tone(f, d, v, type) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(), t = this.ctx.currentTime;
    o.type = type; o.frequency.value = f; o.connect(g); g.connect(this.ctx.destination);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.start(t); o.stop(t + d);
  },
  start() {
    this.ensure(); if (!this.ctx || this.timer) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.playing = true;
    this.timer = setInterval(() => {
      const n = this.notes[this.step % this.notes.length];
      this._tone(n, 0.18, 0.03, 'square');
      if (this.step % 4 === 0) this._tone(n / 2, 0.36, 0.02, 'triangle');
      this.step++;
    }, 200);
  },
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } this.playing = false; }
};

class UIButton extends Phaser.GameObjects.Image
{
  constructor(scene, x, y, texture1, texture2) {
    super(scene, x, y, "anims_ui", texture1);

    // Add to scene
    scene.add.existing(this);

    // Fix in place when camera moves, and sit on top of the game.
    this.setScrollFactor(0).setDepth(105);

    // When the button is clicked it will toggle between texture1 and texture2
    this.initialX = x;  // Initial x position, will be changed when entering fullscreen
    this.texture1 = texture1;
    this.texture2 = texture2;
    this.activated = false;

    // Texture to display at creation or at scene wake event
    const self = this;
    this.setInitialTexture(self);
    scene.events.on('wake', () => this.setInitialTexture(self))  // IMPLEMENT IN SUBCLASS!!!

    // Binding for the pointerdown event
    this.setInteractive({useHandCursor: true}).on('pointerdown', () => this.clickButton(self, scene))
  }

  clickButton(self, scene) {
    window.mouseOverMenu = true;  // Do not move the player
    if (!self.activated) {
      self.activateButton(self, scene);  // IMPLEMENT IN SUBCLASS!!!
    } else {
      self.deactivateButton(self, scene);  // IMPLEMENT IN SUBCLASS!!!
    }
  }
}


export class FullscreenButton extends UIButton {
  constructor(scene, x, y, texture1, texture2) {
    super(scene, x, y, texture1, texture2);

    scene.scale.on('enterfullscreen', () => this.enterFullScreen(this))
    scene.scale.on('leavefullscreen', () => this.leaveFullScreen(this))
  }

  setInitialTexture(self) {
    if (self.scene.scale.isFullscreen) {
      // If we are already at fullscreen
      self.setTexture("anims_ui", self.texture2);  // set the exit fullscreen texture
      self.x = self.initialX - 70;    // move buttons to the left
      self.scene.musicButton.x = self.scene.musicButton.initialX - 70;
    } else {
      // Otherwise, the enter fullscreen one, and return the buttons to orig place
      self.setTexture("anims_ui", self.texture1);
      self.x = self.initialX;
      self.scene.musicButton.x = self.scene.musicButton.initialX;
    }
  }

  activateButton(self, scene) {
    self.scene.scale.startFullscreen();  // Will fire an event that calls the function below
                                         // Done like this in case the user enters fullscreen without pressing the button
  }

  enterFullScreen(self) {
    self.setTexture("anims_ui", self.texture2);

    // Move the buttons to the left (since the menu disappears)
    self.x = self.initialX - 70;
    self.scene.musicButton.x = self.scene.musicButton.initialX - 70;

    self.activated = true;
  }

  deactivateButton(self, scene) {
    self.scene.scale.stopFullscreen();  // Will fire an event that calls the function below
                                        // Done like this in case the user exits fullscreen mode without pressing the button
  }

  leaveFullScreen(self) {
    self.setTexture("anims_ui", self.texture1);

    // Move the buttons to the right (since the menu resappears)
    self.x = self.initialX;
    self.scene.musicButton.x = self.scene.musicButton.initialX;

    self.activated = false;
  }
}


export class MusicButton extends UIButton {
  setInitialTexture(self) {
    // Keep in sync with the (scene-independent) chiptune state
    self.activated = Chiptune.playing;
    self.setTexture("anims_ui", Chiptune.playing ? self.texture2 : self.texture1);
  }

  activateButton(self, scene) {
    Chiptune.start();
    self.setTexture("anims_ui", self.texture2);
    self.activated = true;
  }

  deactivateButton(self, scene) {
    Chiptune.stop();
    self.setTexture("anims_ui", self.texture1);
    self.activated = false;
  }
}
