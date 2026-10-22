#!/bin/zsh
# usage: density-sweep.sh <outdir> <density>...   (ANDROID_SERIAL set; repro app installed)
out=$1; shift
for d in "$@"; do
  adb shell wm density $d; sleep 4
  adb shell input keyevent KEYCODE_HOME; sleep 2
  adb shell input keyevent KEYCODE_ALL_APPS; sleep 3
  adb shell input keyevent KEYCODE_BACK; sleep 1   # hide the search keyboard, keep the drawer
  adb shell input swipe 540 1800 540 600 300; sleep 2
  adb exec-out screencap -p > $out/drawer_$d.png
  px=$(adb shell dumpsys activity service com.google.android.apps.nexuslauncher/com.android.quickstep.TouchInteractionService | grep -m1 -o 'iconSizePx=[0-9]*')
  echo "$d $px"
done
adb shell wm density reset
