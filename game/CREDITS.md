# Trainer Mode — credits & attribution

The "Trainer Mode" game is built on the open-source structure of
**Ariel Roffé's Quest** (<https://github.com/ariroffe/personal-website>, MIT
license), and reuses the public-domain art/font assets that repo compiled.
Only the code structure and free assets were reused; all in-game text, the
section mapping, the Jirachi theme, and the audio are original to this site.

## Assets

- **Tileset** (`assets/prod/tilesets_and_maps/tileset_extruded.png`) — compiled
  by Ariel Roffé from public-domain Pokémon-style tilesets by **ChaoticCherryCake**
  ("Pokemon Tileset From Public Tiles" / "Public Indoor Tileset From Public
  Tiles", themselves crediting other public-tile artists), plus a few sprites
  from **PokeFans** and **OpenGameArt** (CC0).
- **Character / UI atlases** (`assets/prod/atlas/*`) — from the same public-domain
  sources above.
- **Pixel font** (`assets/prod/fonts/pixelop.*`) — *Pixel Operator* by
  **HarvettFox96** (public domain / CC0). *(No longer rendered — the atlas is
  fully opaque and can't be tinted under the Canvas renderer.)*
- **In-game readable text** uses *Press Start 2P* by **CodeMan38** (SIL Open
  Font License 1.1), loaded from Google Fonts.
- **Tilemaps** (`assets/prod/tilesets_and_maps/*.json`) — originally authored by
  Ariel Roffé in [Tiled](https://www.mapeditor.org/); the in-game text has been
  rewritten for this site.

## Intentionally NOT reused

- Ariel's **background music** (8-bit remixes by *Bulby*) was included in his repo
  "with his permission" — that permission is not transferable, so it is not used
  here. Background music is an original WebAudio chiptune instead
  (`scenes/interactive/UIButton.js`).
- Ariel's **profile photo** and personal bio content.

Engine: [Phaser 3](https://phaser.io/) (loaded from jsDelivr CDN).
