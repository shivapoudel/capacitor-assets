// node edges.js shot.png x,y [x,y...]  (x,y = any point inside a red icon, screen px)
// Finds the icon's bbox by flood along the centre row/column and prints the
// pixels across each edge, at the circle's extremes.
const sharp = require(process.env.SHARP);
(async () => {
  const [file, ...pts] = process.argv.slice(2);
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (y * info.width + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };
  const isRed = ([r, g, b]) => r > 200 && g < 60 && b < 60;
  const isIcon = ([r]) => r > 235; // red layer or white square; the drawer background and shadow are below this
  for (const p of pts) {
    let [x, y] = p.split(',').map(Number);
    // walk to find extents along row and column through (x,y), then re-centre
    const ext = (x, y, dx, dy) => { while (isIcon(px(x + dx, y + dy))) { x += dx; y += dy; } return [x, y]; };
    for (let k = 0; k < 2; k++) {
      const l = ext(x, y, -1, 0)[0], r = ext(x, y, 1, 0)[0], t = ext(x, y, 0, -1)[1], b = ext(x, y, 0, 1)[1];
      x = Math.round((l + r) / 2); y = Math.round((t + b) / 2);
    }
    const l = ext(x, y, -1, 0)[0], r = ext(x, y, 1, 0)[0], t = ext(x, y, 0, -1)[1], b = ext(x, y, 0, 1)[1];
    const f = (c) => c.join(',').padEnd(11);
    console.log(`icon at ${p}: centre ${x},${y} red span x ${l}..${r} (${r - l + 1}px) y ${t}..${b} (${b - t + 1}px)`);
    console.log(`  top    rows ${t - 1}..${t + 1} @x=${x}: ${[t - 1, t, t + 1].map((yy) => f(px(x, yy))).join(' ')}`);
    console.log(`  bottom rows ${b - 1}..${b + 2} @x=${x}: ${[b - 1, b, b + 1, b + 2].map((yy) => f(px(x, yy))).join(' ')}`);
    console.log(`  left   cols ${l - 1}..${l + 1} @y=${y}: ${[l - 1, l, l + 1].map((xx) => f(px(xx, y))).join(' ')}`);
    console.log(`  right  cols ${r - 1}..${r + 2} @y=${y}: ${[r - 1, r, r + 1, r + 2].map((xx) => f(px(xx, y))).join(' ')}`);
  }
})();
