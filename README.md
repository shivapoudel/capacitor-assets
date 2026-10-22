# Proof: black line on Android adaptive icons generated with `android:inset="16.7%"`

Evidence for the pull request that draws the adaptive icon layers full bleed in `@capawesome/capacitor-assets`.

## Why

`AdaptiveIconDrawable` gives each layer a rect of 1.5x the icon size, paints the layer bitmap black, then draws
the layers. `InsetDrawable` rounds the inset down (`(int)(bound * fraction)`), so when the launcher's icon size is
`4n + 1` pixels the inset background ends one pixel short and the last row and column of the icon stay black.
Exact 1/6 rounds the same way. A layer with no inset always covers.

## Contents

- `apps/inset-repro/`: draws three hand-made adaptive icons (16.7%, 1/6, full bleed) into W x W bitmaps for
  W = 32..320, as a launcher does, and logs the edge pixels (tag `INSETGAP`).
- `apps/tool-repro/`: the same check on the icons the tool generates, `gen_old` from 5.0.0 and `gen_new` from the
  pull request (tag `TOOLGAP`). Source assets: a solid red background, a transparent foreground with a white square.
- `launcher3/5.0.0-vs-this-pr/`: AOSP Launcher3 cached icon bitmaps (API 30 emulator, `wm density 320` and `360`),
  pulled from `app_icons.db`. `MainActivity_*` is 5.0.0, `New_*` is the pull request.
- `launcher3/xml-variants/`: the same for the hand-made 16.7% (`MainActivity`), 1/6 (`Exact`) and full bleed icons.
- `pixel-launcher/`: Pixel Launcher app drawer screenshots (API 37 emulator), 420dpi shows the line, 440dpi does not.
- `zoom/`: 360dpi Launcher3 bitmaps scaled up with nearest neighbour; `bottom-right-*` is the corner, 5.0.0 left.
- `scripts/`: the readers (`bitmap-edges.js` needs `SHARP=<path to sharp>`) and the density sweep.

Build an app with `JAVA_HOME=<JDK 21> ./gradlew assembleDebug`, install it and read `adb logcat -s TOOLGAP:I`.

## Results

| | uncovered edge pixel, W = 32..320 | Launcher3 320dpi (W = 89) | Launcher3 360dpi (W = 101) |
|---|---|---|---|
| 5.0.0 (`inset 16.7%`) | 72 of 289 sizes, every `W = 4n + 1` | bottom/right `0,0,0,255` | bottom/right `0,0,0,255` |
| hand-made 1/6 | 72 of 289 | bottom/right `0,0,0,255` | bottom/right `0,0,0,255` |
| pull request (full bleed) | 0 of 289 | red | red |

The foreground is the same size in both: the white square spans columns 45..64 at 320dpi and 51..72 at 360dpi
for 5.0.0 and the pull request alike.
