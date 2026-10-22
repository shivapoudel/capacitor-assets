// node bitmap-edges.js icon.png...  For a launcher's cached icon bitmap: the red
// mask's extent, and the pixels at and just past its bottom/right edges.
const sharp = require(process.env.SHARP);
(async () => {
  for (const f of process.argv.slice(2)) {
    const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, px = (x, y) => [...data.subarray((y * W + x) * 4, (y * W + x) * 4 + 4)];
    const cx = Math.floor(W / 2);
    let t = 0; while (px(cx, t)[0] < 200 || px(cx, t)[1] > 60) t++;
    let b = info.height - 1; while (!(px(cx, b)[3] > 200)) b--;   // last opaque row, whatever colour
    let l = 0; while (px(l, cx)[0] < 200 || px(l, cx)[1] > 60) l++;
    let r = W - 1; while (!(px(r, cx)[3] > 200)) r--;
    const s = (c) => c.join(',');
    console.log(`${f}: bitmap ${W}x${info.height}, opaque mask rows ${t}..${b} (${b - t + 1}px), cols ${l}..${r}`);
    console.log(`  top ${s(px(cx, t))} | bottom-1 ${s(px(cx, b - 1))} bottom ${s(px(cx, b))} | left ${s(px(l, cx))} | right-1 ${s(px(r - 1, cx))} right ${s(px(r, cx))}  (RGBA)`);
  }
})();
