// Jirachi palette — mirrors the --color-* custom properties in style.css so the
// game UI and the normal site read as one cohesive theme.
export const PAL = {
    navy: 0x1b2a4a,   // deep starry navy (text on cream / dark fills)
    indigo: 0x2c3e6b, // borders
    gold: 0xf4d03f,   // accent — dialogue borders, headings, star cues
    mint: 0x8fe0cc,   // hover / highlight
    cream: 0xfff8e7,  // dialogue background / body text on dark
    ink: 0x181818     // outline black
};

// Hex strings for Phaser.Text fill colors (the bundled bitmap atlas is fully
// opaque and can't be tinted under the Canvas renderer, so all readable text
// uses real Text objects in the Press Start 2P web font instead).
export const PAL_HEX = { navy: '#1b2a4a', gold: '#f4d03f', amber: '#9a7b12', mint: '#8fe0cc', cream: '#fff8e7' };
export const FONT = '"Press Start 2P"';

// Crisp pixel Text helper. Default: 8px navy, left-aligned. Press Start 2P is
// designed on an 8px grid, so keep sizes at multiples where possible.
export function pxText(scene, x, y, text, size = 8, color = PAL_HEX.navy, align = 'left') {
    return scene.add.text(Math.round(x), Math.round(y), text, {
        fontFamily: FONT, fontSize: size + 'px', color: color, align: align,
        resolution: 2, lineSpacing: Math.round(size * 0.6)
    });
}
