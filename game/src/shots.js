// Deterministic screenshot scenes behind ?shot=start|play|level2|win.
// Each stages the real game state (no fake drawing): guards mid-patrol,
// cameras mid-sweep, cones clipped by cover, loot taken, alarm part-filled.

import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

function placeGuard(state, index, x, y, angle) {
  const g = state.guards[index];
  if (!g) return;
  g.x = x;
  g.y = y;
  g.angle = angle;
  g.wait = 0;
}

function aimCamera(state, index, angle) {
  const cam = state.cameras[index];
  if (!cam) return;
  cam.angle = angle;
  cam.frozen = true; // shot mode never steps, but keep the pose explicit
}

export function stageShot(name, game) {
  if (name === 'play') {
    // Cover shot: Lobby Marble mid-crossing — guard cones, the sweeping
    // camera cone, gold bars, the EXIT door and the ALARM meter all in frame.
    game.reset(0, 0);
    const s = game.state;
    s.score = 450;
    s.timeLeft = 104;
    s.alarm = 0.42;
    s.coins = 5;
    s.smokesLeft = 2;
    s.player.x = 600;
    s.player.y = 470;
    s.player.sneak = true;
    s.loot[0].taken = true;
    s.loot[3].taken = true;
    s.lootTaken = 2;
    placeGuard(s, 0, 350, 430, Math.PI / 2); // facing down past the pillar
    placeGuard(s, 1, 1080, 430, Math.PI); // facing left across the rug
    s.guards[0].seeing = true;
    aimCamera(s, 0, Math.PI / 2 + 0.35); // sweeping down-right over the lobby
    s.cameras[0].seeing = false;
    s.lure = { x: 760, y: 300, t: 2.4 };
    s.smokes = [{ x: 470, y: 620, r: 84, t: 3.1 }];
    return { screen: SCREEN_PLAY, best: 1620 };
  }
  if (name === 'level2') {
    game.reset(1, 1620);
    const s = game.state;
    s.score = 1980;
    s.timeLeft = 128;
    s.alarm = 0.24;
    s.coins = 6;
    s.smokesLeft = 3;
    s.player.x = 170;
    s.player.y = 620;
    s.player.sneak = false;
    s.loot[1].taken = true;
    s.lootTaken = 1;
    placeGuard(s, 0, 640, 445, 0);
    placeGuard(s, 1, 700, 160, Math.PI);
    placeGuard(s, 2, 640, 560, Math.PI / 2);
    aimCamera(s, 0, Math.PI / 2 - 0.5);
    aimCamera(s, 1, -Math.PI / 2 + 0.5);
    s.cameras[1].seeing = true;
    return { screen: SCREEN_PLAY, best: 1980 };
  }
  if (name === 'win') {
    game.reset(2, 0);
    const s = game.state;
    s.score = 4120;
    s.timeLeft = 71;
    s.alarm = 0;
    s.loot.forEach((item) => { item.taken = true; });
    s.lootTaken = s.loot.length;
    s.hasLedger = true;
    s.player.x = s.level.exit.x + 42;
    s.player.y = s.level.exit.y + 42;
    placeGuard(s, 0, 640, 390, 0);
    placeGuard(s, 1, 300, 120, Math.PI / 2);
    placeGuard(s, 2, 640, 360, Math.PI);
    placeGuard(s, 3, 740, 500, 0);
    aimCamera(s, 0, Math.PI / 2);
    aimCamera(s, 1, 0.4);
    aimCamera(s, 2, Math.PI - 0.4);
    return { screen: SCREEN_WIN, best: 4120 };
  }
  // start (default)
  game.reset(0, 0);
  const s = game.state;
  placeGuard(s, 0, 350, 280, 0);
  placeGuard(s, 1, 1080, 560, -Math.PI / 2);
  aimCamera(s, 0, Math.PI / 2);
  return { screen: SCREEN_TITLE, best: 0 };
}
