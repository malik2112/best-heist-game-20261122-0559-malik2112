// The three floors of the Sunken Ledger job.
// cover rects block movement AND sight (pillars, crates, counters, walls).
// guards: patrol waypoint loops. cameras: fixed mounts that sweep a cone
// back and forth between sweepMin and sweepMax (radians, 0 = east).
// loot: 'gold' bars anywhere; the 'ledger' sits in the Vault Core and the
// service door there stays locked until it is in your bag.

export const LEVELS = [
  {
    name: 'Lobby Marble',
    hint: 'Cross the marble lobby. Pillars break sight lines — use them.',
    time: 150,
    start: { x: 90, y: 640 },
    exit: { x: 1160, y: 60, w: 84, h: 84 },
    cover: [
      { x: 300, y: 180, w: 44, h: 44, kind: 'pillar' },
      { x: 300, y: 470, w: 44, h: 44, kind: 'pillar' },
      { x: 620, y: 320, w: 44, h: 44, kind: 'pillar' },
      { x: 920, y: 180, w: 44, h: 44, kind: 'pillar' },
      { x: 920, y: 470, w: 44, h: 44, kind: 'pillar' },
      { x: 470, y: 120, w: 150, h: 40, kind: 'counter' },
      { x: 470, y: 560, w: 150, h: 40, kind: 'counter' },
      { x: 760, y: 300, w: 90, h: 60, kind: 'crate' },
      { x: 150, y: 300, w: 90, h: 60, kind: 'crate' },
    ],
    guards: [
      { path: [[350, 280], [350, 470], [560, 470], [560, 280]] },
      { path: [[1080, 560], [1080, 300], [880, 300], [880, 560]] },
    ],
    cameras: [
      { x: 640, y: 46, sweepMin: 0.55, sweepMax: 2.59, phase: 0 },
    ],
    loot: [
      { x: 545, y: 95, kind: 'gold' },
      { x: 545, y: 635, kind: 'gold' },
      { x: 805, y: 265, kind: 'gold' },
      { x: 195, y: 400, kind: 'gold' },
      { x: 1050, y: 120, kind: 'gold' },
    ],
  },
  {
    name: 'Camera Gallery',
    hint: 'Two wall cameras sweep the gallery. Time your crossings between sweeps.',
    time: 165,
    start: { x: 90, y: 90 },
    exit: { x: 1160, y: 576, w: 84, h: 84 },
    cover: [
      { x: 250, y: 240, w: 200, h: 40, kind: 'counter' },
      { x: 250, y: 440, w: 200, h: 40, kind: 'counter' },
      { x: 830, y: 240, w: 200, h: 40, kind: 'counter' },
      { x: 830, y: 440, w: 200, h: 40, kind: 'counter' },
      { x: 595, y: 150, w: 44, h: 44, kind: 'pillar' },
      { x: 595, y: 330, w: 44, h: 44, kind: 'pillar' },
      { x: 595, y: 510, w: 44, h: 44, kind: 'pillar' },
      { x: 120, y: 330, w: 90, h: 60, kind: 'crate' },
      { x: 1070, y: 330, w: 90, h: 60, kind: 'crate' },
    ],
    guards: [
      { path: [[540, 330], [740, 330], [740, 560], [540, 560]] },
      { path: [[350, 120], [930, 120], [930, 200], [350, 200]] },
      { path: [[350, 600], [930, 600], [930, 520], [350, 520]] },
    ],
    cameras: [
      { x: 350, y: 46, sweepMin: 0.7, sweepMax: 2.44, phase: 1.2 },
      { x: 930, y: 674, sweepMin: -2.44, sweepMax: -0.7, phase: 3.1 },
    ],
    loot: [
      { x: 350, y: 205, kind: 'gold' },
      { x: 350, y: 515, kind: 'gold' },
      { x: 930, y: 205, kind: 'gold' },
      { x: 930, y: 515, kind: 'gold' },
      { x: 640, y: 360, kind: 'gold' },
      { x: 165, y: 620, kind: 'gold' },
    ],
  },
  {
    name: 'Vault Core',
    hint: 'The Sunken Ledger is in the vault. The service door stays locked until you take it.',
    time: 180,
    start: { x: 640, y: 650 },
    exit: { x: 60, y: 60, w: 84, h: 84 },
    cover: [
      { x: 480, y: 200, w: 320, h: 36, kind: 'wall' },
      { x: 480, y: 484, w: 320, h: 36, kind: 'wall' },
      { x: 480, y: 236, w: 36, h: 100, kind: 'wall' },
      { x: 764, y: 384, w: 36, h: 100, kind: 'wall' },
      { x: 250, y: 150, w: 44, h: 44, kind: 'pillar' },
      { x: 986, y: 150, w: 44, h: 44, kind: 'pillar' },
      { x: 250, y: 526, w: 44, h: 44, kind: 'pillar' },
      { x: 986, y: 526, w: 44, h: 44, kind: 'pillar' },
      { x: 120, y: 330, w: 90, h: 60, kind: 'crate' },
      { x: 1070, y: 330, w: 90, h: 60, kind: 'crate' },
      { x: 595, y: 330, w: 90, h: 60, kind: 'crate' },
    ],
    guards: [
      { path: [[300, 340], [980, 340], [980, 440], [300, 440]] },
      { path: [[640, 120], [1120, 120], [1120, 620], [160, 620], [160, 120]] },
      { path: [[560, 280], [720, 280], [720, 440], [560, 440]] },
      { path: [[640, 560], [640, 430], [820, 430], [820, 560]] },
    ],
    cameras: [
      { x: 640, y: 46, sweepMin: 0.6, sweepMax: 2.54, phase: 0.4 },
      { x: 46, y: 360, sweepMin: -0.9, sweepMax: 0.9, phase: 2.2 },
      { x: 1234, y: 360, sweepMin: 2.24, sweepMax: 4.04, phase: 4.0 },
    ],
    loot: [
      { x: 640, y: 270, kind: 'ledger' },
      { x: 555, y: 360, kind: 'gold' },
      { x: 725, y: 360, kind: 'gold' },
      { x: 272, y: 120, kind: 'gold' },
      { x: 1008, y: 120, kind: 'gold' },
      { x: 272, y: 600, kind: 'gold' },
      { x: 1008, y: 600, kind: 'gold' },
    ],
  },
];
