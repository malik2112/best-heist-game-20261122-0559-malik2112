// Vault of the Sunken Ledger — shared tuning.
// One top-down bank floor per level, 1280x720. Guards patrol with vision
// cones, wall cameras sweep their own cones, and one ALARM meter fills
// whenever either kind of eye can see you. Fill it and the alarm trips:
// the level restarts. Steal the gold bars, take the Sunken Ledger in the
// Vault Core, and slip out the service door.

export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const BEST_KEY = 'vault-sunken-ledger-best';

export const PLAYER = {
  radius: 13,
  speed: 215,
  sneakSpeed: 110,
};

export const GUARD = {
  radius: 13,
  speed: 92,
  viewRange: 265,
  viewHalfAngle: 0.52,
  pauseAtWaypoint: 0.9,
};

export const CAMERA = {
  viewRange: 300,
  viewHalfAngle: 0.42,
  sweepSpeed: 0.55, // radians per second of sweep travel
};

export const RULES = {
  alarmFill: 0.62, // per second at closest range, before the distance falloff
  alarmDecay: 0.30,
  sneakFactor: 0.34, // sneaking: alarm fills at about a third of the rate
  cameraFactor: 0.8, // cameras are a touch slower to convince than guards
  coins: 6,
  smokes: 3,
  lureSeconds: 3.2,
  smokeRadius: 84,
  smokeSeconds: 4.2,
  goldScore: 150,
  ledgerScore: 900,
  levelBonus: 300,
  timeBonusPerSecond: 4,
};

export const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';

export const PALETTE = {
  floor: '#23262e',
  floorTile: '#2a2e38',
  rug: '#3d2c46',
  wall: '#4a4f5e',
  wallTop: '#5d6374',
  pillar: '#6b6f7c',
  pillarTop: '#868b9a',
  crate: '#5b4a33',
  crateTop: '#77603f',
  counter: '#37414f',
  counterTop: '#48566b',
  cone: 'rgba(255, 190, 60, 0.20)',
  coneAlert: 'rgba(255, 80, 60, 0.32)',
  camCone: 'rgba(80, 200, 255, 0.16)',
  camConeAlert: 'rgba(255, 90, 90, 0.30)',
  guard: '#c94f42',
  guardDark: '#8f332a',
  player: '#2e2a3a',
  playerTrim: '#ffd75e',
  gold: '#f5c542',
  goldDark: '#b8860b',
  ledger: '#7ee0a3',
  exit: '#3fae6a',
  exitLocked: '#8a4b4b',
  ink: '#e8eaf2',
  dim: '#9aa0b4',
  panel: 'rgba(12, 13, 20, 0.82)',
  alarm: '#ff5a4e',
  alarmMid: '#ffb03a',
  ok: '#7ee0a3',
};
