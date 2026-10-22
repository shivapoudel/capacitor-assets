// node red-icons.js shot.png...  Finds the repro app's red icons (pure #FF0000
// blobs), in drawer order (Full bleed, Inset 1/6, Inset 16.7%), and prints the
// pixel just past each edge at the circle's extremes. A covered edge blends
// into the drawer background; the bug shows as a dark red (r<100, g=b=0) pixel.
const sharp = require(process.env.SHARP);
(async () => {
  for (const file of process.argv.slice(2)) {
    const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height;
    const px = (x, y) => { const i = (y * W + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };
    const red = (x, y) => { const [r, g, b] = px(x, y); return r === 255 && g < 8 && b < 8; };
    const seen = new Uint8Array(W * H), blobs = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (seen[y * W + x] || !red(x, y)) continue;
      let l = x, r = x, t = y, b = y, n = 0; const st = [[x, y]]; seen[y * W + x] = 1;
      while (st.length) { const [cx, cy] = st.pop(); n++;
        if (cx < l) l = cx; if (cx > r) r = cx; if (cy < t) t = cy; if (cy > b) b = cy;
        for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]])
          if (nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny*W+nx] && red(nx, ny)) { seen[ny*W+nx] = 1; st.push([nx, ny]); } }
      if (n > 2000 && r - l > 60) blobs.push({ l, r, t, b });
    }
    blobs.sort((a, c) => Math.abs(a.t - c.t) > 30 ? a.t - c.t : a.l - c.l);
    const names = ['Full bleed', 'Inset 1/6', 'Inset 16.7%'];
    console.log(file.split('/').pop());
    blobs.forEach((k, i) => {
      const cx = Math.round((k.l + k.r) / 2), cy = Math.round((k.t + k.b) / 2);
      const s = (c) => c.join(',');
      console.log(`  ${(names[i] ?? '?').padEnd(12)} span ${k.r - k.l + 1}x${k.b - k.t + 1}  top-1 ${s(px(cx, k.t - 1))}  left-1 ${s(px(k.l - 1, cy))}  bottom+1 ${s(px(cx, k.b + 1))}  right+1 ${s(px(k.r + 1, cy))}`);
    });
  }
})();
