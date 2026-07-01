export class BaseScene extends Phaser.Scene {

  constructor(key) {
    super(key);
  }

  // --------------------------------------------------------------------------------------------------
  // CREATE
  create(tilemapKey) {
    // Force nearest-neighbour filtering on every texture (incl. the bitmap
    // font) so nothing gets bilinear-smoothed/blurred when scaled up. pixelArt
    // should do this, but some GPUs default the font texture to LINEAR.
    ['TilesetImage', 'atlas', 'anims_ui', 'pixelop', 'jirachi'].forEach(k => {
      if (this.textures.exists(k)) this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    // ----------------
    // MAP AND TILESET
    this.map = this.make.tilemap({key: tilemapKey});
    // const tileset = this.map.addTilesetImage("tileset", "TilesetImage");
    // With added margin and spacing for the extruded image:
    const tileset = this.map.addTilesetImage("tileset", "TilesetImage", 32, 32, 1, 2);

    // Map layers (defined in Tiled)
    this.map.createLayer("Ground1", tileset, 0, 0);
    this.map.createLayer("Ground2", tileset, 0, 0);
    this.map.createLayer("Collision1", tileset, 0, 0);
    this.map.createLayer("Collision2", tileset, 0, 0);
    this.map.createLayer("Above", tileset, 0, 0).setDepth(10);  // To have the "Above" layer sit on top of the player, we give it a depth.
    // The layer with wich the player will collide
    this.LayerToCollide = this.map.createLayer("CollisionLayer", tileset, 0, 0);
    this.LayerToCollide.setVisible(false);  // Comment out this line if you wish to see which objects the player will collide with

    // ----------------
    // PLAYER
    // Get the spawn point
    const spawnPoint = this.map.findObject("Objects", obj => obj.name === "Spawn Point");
    
    // Create the player and the player animations (see player.js)
    this.player = this.add.player(spawnPoint.x, spawnPoint.y, "atlas", "ariel-front")

    // ----------------
    // CAMERA AND CURSORS
    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      w: this.input.keyboard.addKey('W'),
      a: this.input.keyboard.addKey('A'),
      s: this.input.keyboard.addKey('S'),
      d: this.input.keyboard.addKey('D'),
    }

    // Camera resize behavior
    this.scale.on('resize', this.resize, this);

    // ENTER / SPACE opens the link of the signpost the player is standing at
    const openActiveLink = () => { if (this.activeLink && !this.guideOpen) this.activeLink.open(); };
    this.input.keyboard.on('keydown-ENTER', openActiveLink);
    this.input.keyboard.on('keydown-SPACE', openActiveLink);

    // ----------------
    // INTERACTIVE OBJECTS
    this.signs = [];
    this.showingSign = false;
    this.activeLink = null;   // the LinkPost the player is standing at (ENTER opens it)
    this.map.filterObjects("Objects", obj => {

      // DOORS
      if (obj.name === 'door') {
        this.add.door(Math.round(obj.x), Math.round(obj.y), obj.width, obj.height, obj.properties[0].value, obj.properties[1].value);
        // last 2: destination (str) and link (bool, if true leads to a redirect)
      }

      // LINK POSTS (social / CV signposts that open an external link)
      else if (obj.name === 'linkPost') {
        const p = {}; (obj.properties || []).forEach(pr => p[pr.name] = pr.value);
        this.signs.push(this.add.linkPost(Math.round(obj.x), Math.round(obj.y), p.text, p.url, p.label));
      }

      // BIGSIGNS (text that shows on the purple squares)
      else if (obj.name === 'bigSign') {
        this.bigSign = this.add.bigSign(Math.round(obj.x), Math.round(obj.y), obj.width, obj.height,
          obj.properties[0].value, obj.properties[1].value, obj.properties[2].value, obj.properties[3].value,
          obj.properties[4].value)
          // last parameters are signX, signY, sm_signX, sm_signY, text
      }

      // SIGNS
      else if (obj.name === 'sign') {
        this.signs.push(this.add.sign(obj.x, obj.y, obj.properties[1].value, obj.properties[0].value))
        // Last parameters are the text to show and the direction of the text in relation to the object
      }
    });

    // ----------------
    // JIRACHI THEME: a subtle gold wash over the world (below signs @100 and UI @105)
    this.add.rectangle(0, 0, 6000, 6000, 0xF4D03F)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(50)
      .setAlpha(0.10).setBlendMode(Phaser.BlendModes.SCREEN);

    // ----------------
    // UI BUTTONS (PLAY MUSIC AND FULLSCREEN)
    this.musicButton = this.add.musicButton(120, 45, 'mute', 'play');
    if (this.sys.game.device.fullscreen.available) this.fullscreenButton = this.add.fullscreenButton(180, 45, 'fullscreen', 'fullscreen2');
  }

  // ---------------------------------------------------
  resize (gameSize, baseSize, displaySize, resolution) {
     this.cameras.resize(gameSize.width, gameSize.height);
  }

  collide_with_world() {
    // Collision with the world layers. Has to come after the rest of the colliders in order for them to detect.
    // We need to call this at the end of the children's create
    this.physics.add.collider(this.player, this.LayerToCollide);
    this.LayerToCollide.setCollisionBetween(40, 41);

    // Set the player to collide with the world bounds
    this.player.body.setCollideWorldBounds(true);
    this.player.body.onWorldBounds = true;
  }

  // --------------------------------------------------------------------------------------------------
  // UPDATE
  update(time, delta) {
    let moveleft = false;
    let moveright = false;
    let moveup = false;
    let movedown = false;

    // ----------------
    // MOUSE MOVEMENT
    let pointer = this.input.activePointer;
    if (pointer.primaryDown && !window.mouseOverMenu) {
      // If you press the pointer outside the menu, hide it... Done here bc otherwise takes till after movement
      // to execute this command
      document.getElementById("game-menu").style.display = 'none';
      // let pointerPosition = pointer.position;
      // So that the x and y update if the camera moves and the mouse does not
      let pointerPosition = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      // Horizontal movement
      if (Math.abs(pointerPosition.x - this.player.x) > 15) {  // To avoid glitching when the player hits the cursor
        if (pointerPosition.x > this.player.x) {
          moveright = true;
        } else if (pointerPosition.x < this.player.x) {
          moveleft = true;
        }
      }

      // Vertical movement
      if (Math.abs(pointerPosition.y - this.player.y) > 15) {  // To avoid glitching when the player hits the cursor
        if (pointerPosition.y > this.player.y) {
          movedown = true;
        } else if (pointerPosition.y < this.player.y) {
          moveup = true;
        }
      }
    }

    // ----------------
    // KEYBOARD MOVEMENT
    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.a.isDown) {
      moveleft = true;
    } else if (this.cursors.right.isDown || this.wasd.d.isDown) {
      moveright = true;
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.wasd.w.isDown) {
      moveup = true;
    } else if (this.cursors.down.isDown || this.wasd.s.isDown) {
      movedown = true;
    }

    // Update player velocity and animation
    this.player.update(moveleft, moveright, moveup, movedown);

    // ---------------------
    // INTERACTIVE OBJECTS
    // Hide the signs
    if (this.showingSign && (moveleft || moveright || moveup || movedown)) {
      this.signs.forEach((sign) => {
        if (sign.activated) sign.playerMovement(moveleft, moveright, moveup, movedown)
      });
    }
    // Hide the bigSign
    this.bigSign.hideSignText(this.player);  // Needs to be outside the conitional in case the player goes out and immediately stops moving
  }

}
