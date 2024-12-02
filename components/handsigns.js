// components/HandSigns.js

import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

// Create an object to hold all the hand signs
const Handsigns = {};

// Letter A
const aSign = new GestureDescription('a');
// Thumb: No Curl, Vertical Up
aSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
aSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
// Other fingers: Full Curl, Vertical Up
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  aSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
  aSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.aSign = aSign;

// Letter B
const bSign = new GestureDescription('b');
// Thumb: Cross over palm
bSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
bSign.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1.0);
// Other fingers: No Curl, Vertical Up
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  bSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  bSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.bSign = bSign;

// Letter C
const cSign = new GestureDescription('c');
// All fingers: Half Curl, Vertical Up
for (let finger of Finger.all) {
  cSign.addCurl(finger, FingerCurl.HalfCurl, 1.0);
  cSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.cSign = cSign;

// Letter D
const dSign = new GestureDescription('d');
// Index: No Curl, Vertical Up
dSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
dSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
// Thumb: Touching middle finger
dSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
dSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  dSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
  dSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.dSign = dSign;

// Letter E
const eSign = new GestureDescription('e');
// All fingers: Full Curl, Vertical Up
for (let finger of Finger.all) {
  eSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
  eSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.eSign = eSign;

// Letter F
const fSign = new GestureDescription('f');
// Thumb and Index: Form a circle
fSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
fSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
fSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);
// Other fingers: No Curl, Vertical Up
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  fSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  fSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.fSign = fSign;

// Letter G
const gSign = new GestureDescription('g');
// Thumb: No Curl, Horizontal Right
gSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
gSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);
// Index: No Curl, Horizontal Left
gSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
gSign.addDirection(Finger.Index, FingerDirection.HorizontalLeft, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  gSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
  gSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.gSign = gSign;

// Letter H
const hSign = new GestureDescription('h');
// Index and Middle: No Curl, Horizontal Left
for (let finger of [Finger.Index, Finger.Middle]) {
  hSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  hSign.addDirection(finger, FingerDirection.HorizontalLeft, 1.0);
}
// Thumb: Full Curl
hSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
// Ring and Pinky: Full Curl
for (let finger of [Finger.Ring, Finger.Pinky]) {
  hSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.hSign = hSign;

// Letter I
const iSign = new GestureDescription('i');
// Pinky: No Curl, Vertical Up
iSign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
iSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring]) {
  iSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.iSign = iSign;

// Letter J
const jSign = new GestureDescription('j');
// Pinky: No Curl, Draw 'J' motion
// For simplicity in detection, we can treat it similar to 'I'
jSign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
jSign.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring]) {
  jSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.jSign = jSign;

// Letter K
const kSign = new GestureDescription('k');
// Thumb: No Curl
kSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
kSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
// Index and Middle: No Curl, Spread apart
for (let finger of [Finger.Index, Finger.Middle]) {
  kSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  kSign.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.75);
  kSign.addDirection(finger, FingerDirection.DiagonalUpRight, 0.75);
}
// Ring and Pinky: Full Curl
for (let finger of [Finger.Ring, Finger.Pinky]) {
  kSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.kSign = kSign;

// Letter L
const lSign = new GestureDescription('l');
// Thumb: No Curl, Horizontal Right
lSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
lSign.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, 1.0);
// Index: No Curl, Vertical Up
lSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
lSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  lSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.lSign = lSign;

// Letter M
const mSign = new GestureDescription('m');
// Thumb: Under other fingers
mSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  mSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.mSign = mSign;

// Letter N
const nSign = new GestureDescription('n');
// Similar to 'M' but with one fewer finger over thumb
// Thumb: Under other fingers
nSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
// Index, Middle, Ring: Full Curl
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring]) {
  nSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
// Pinky: Full Curl
nSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
Handsigns.nSign = nSign;

// Letter O
const oSign = new GestureDescription('o');
// All fingers and thumb touch to form 'O' shape
for (let finger of Finger.all) {
  oSign.addCurl(finger, FingerCurl.HalfCurl, 1.0);
  oSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
Handsigns.oSign = oSign;

// Letter P
const pSign = new GestureDescription('p');
// Similar to 'K' but pointed downward
// Thumb: No Curl
pSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
pSign.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 1.0);
// Index and Middle: No Curl
for (let finger of [Finger.Index, Finger.Middle]) {
  pSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  pSign.addDirection(finger, FingerDirection.VerticalDown, 1.0);
}
// Ring and Pinky: Full Curl
for (let finger of [Finger.Ring, Finger.Pinky]) {
  pSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.pSign = pSign;

// Letter Q
const qSign = new GestureDescription('q');
// Similar to 'G' but pointed downward
// Thumb: No Curl, Pointing Down
qSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
qSign.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 1.0);
// Index: No Curl, Pointing Down
qSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
qSign.addDirection(Finger.Index, FingerDirection.DiagonalDownLeft, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
  qSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.qSign = qSign;

// Letter R
const rSign = new GestureDescription('r');
// Index and Middle: No Curl, Crossed
rSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
rSign.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
rSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
rSign.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
// Thumb: Full Curl
rSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
// Ring and Pinky: Full Curl
for (let finger of [Finger.Ring, Finger.Pinky]) {
  rSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.rSign = rSign;

// Letter S
const sSign = new GestureDescription('s');
// All fingers and thumb: Full Curl (Fist)
for (let finger of Finger.all) {
  sSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.sSign = sSign;

// Letter T
const tSign = new GestureDescription('t');
// Thumb between Index and Middle fingers
tSign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
tSign.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
// Index: Full Curl
tSign.addCurl(Finger.Index, FingerCurl.FullCurl, 1.0);
// Middle: Full Curl
tSign.addCurl(Finger.Middle, FingerCurl.FullCurl, 1.0);
// Ring and Pinky: Full Curl
for (let finger of [Finger.Ring, Finger.Pinky]) {
  tSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.tSign = tSign;

// Letter U
const uSign = new GestureDescription('u');
// Index and Middle: No Curl, Together
for (let finger of [Finger.Index, Finger.Middle]) {
  uSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  uSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
// Thumb: Full Curl
uSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
// Ring and Pinky: Full Curl
for (let finger of [Finger.Ring, Finger.Pinky]) {
  uSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.uSign = uSign;

// Letter V
const vSign = new GestureDescription('v');
// Index and Middle: No Curl, Spread Apart
for (let finger of [Finger.Index, Finger.Middle]) {
  vSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  vSign.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.75);
  vSign.addDirection(finger, FingerDirection.DiagonalUpRight, 0.75);
}
// Thumb: Full Curl
vSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
// Ring and Pinky: Full Curl
for (let finger of [Finger.Ring, Finger.Pinky]) {
  vSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.vSign = vSign;

// Letter W
const wSign = new GestureDescription('w');
// Index, Middle, Ring: No Curl, Spread Apart
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring]) {
  wSign.addCurl(finger, FingerCurl.NoCurl, 1.0);
  wSign.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}
// Thumb: Full Curl
wSign.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.0);
// Pinky: Full Curl
wSign.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
Handsigns.wSign = wSign;

// Letter X
const xSign = new GestureDescription('x');
// Index: Half Curl, Vertical Up
xSign.addCurl(Finger.Index, FingerCurl.HalfCurl, 1.0);
xSign.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Thumb, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  xSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.xSign = xSign;

// Letter Y
const ySign = new GestureDescription('y');
// Thumb and Pinky: No Curl
ySign.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
ySign.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, 1.0);
ySign.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
ySign.addDirection(Finger.Pinky, FingerDirection.HorizontalRight, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Index, Finger.Middle, Finger.Ring]) {
  ySign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.ySign = ySign;

// Letter Z
const zSign = new GestureDescription('z');
// Index: No Curl, Draw 'Z' in air
// For detection, treat as index extended
zSign.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
zSign.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1.0);
// Other fingers: Full Curl
for (let finger of [Finger.Thumb, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  zSign.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
Handsigns.zSign = zSign;

// Export the hand signs
export default Handsigns;
