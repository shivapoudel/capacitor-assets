package dev.repro.insetgap;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.widget.ScrollView;
import android.widget.TextView;

/**
 * Draws each adaptive icon into a W x W bitmap for W = 32..320, as a launcher
 * does (setBounds(0, 0, W, W), then draw), and reads the pixel at the middle
 * of each edge. The background layer is solid red, so a covered edge pixel is
 * red (the mask's anti-aliasing may lower its alpha, not its colour).
 * AdaptiveIconDrawable fills its layer bitmap with black first, so an uncovered
 * one comes out black.
 *
 * Results go to logcat (tag INSETGAP) and on screen.
 */
public class MainActivity extends Activity {
    private static final String TAG = "TOOLGAP";

    /** getPixel is unpremultiplied: judge the colour, not the alpha. */
    private static boolean red(int argb) {
        return ((argb >> 16) & 0xFF) == 0xFF && (argb & 0xFFFF) == 0;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        StringBuilder out = new StringBuilder();
        int[] ids = {R.mipmap.gen_old, R.mipmap.gen_new};
        String[] names = {"capacitor-assets 5.0.0", "this PR"};
        for (int i = 0; i < ids.length; i++) {
            StringBuilder gaps = new StringBuilder();
            int count = 0;
            for (int w = 32; w <= 320; w++) {
                Drawable d = getDrawable(ids[i]);
                Bitmap b = Bitmap.createBitmap(w, w, Bitmap.Config.ARGB_8888);
                d.setBounds(0, 0, w, w);
                d.draw(new Canvas(b));
                int top = b.getPixel(w / 2, 0);
                int left = b.getPixel(0, w / 2);
                int bottom = b.getPixel(w / 2, w - 1);
                int right = b.getPixel(w - 1, w / 2);
                if (!red(top) || !red(left) || !red(bottom) || !red(right)) {
                    count++;
                    gaps.append(w).append(' ');
                    Log.i(TAG, String.format("%s W=%d top=#%08X left=#%08X bottom=#%08X right=#%08X",
                            names[i], w, top, left, bottom, right));
                }
            }
            String line = String.format("%s: %d of 289 sizes have an uncovered edge pixel: %s",
                    names[i], count, gaps.toString().trim());
            Log.i(TAG, line);
            out.append(line).append("\n\n");
        }
        TextView t = new TextView(this);
        t.setPadding(32, 160, 32, 32);
        t.setText(out);
        ScrollView s = new ScrollView(this);
        s.addView(t);
        setContentView(s);
    }
}
