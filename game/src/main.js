// Boot, game rules and the one loop.
// WASD/arrows move, Shift sneaks, click throws a coin lure, Space drops smoke.
// Guards patrol waypoints and wall cameras sweep; either cone on you fills
// the ALARM meter (cover and smoke block sight). Full meter = alarm trips.
// ?shot=start|play|level2|win stages a deterministic scene for screenshots.

import { BEST_KEY, CAMERA, FIELD, GUARD, PLAYER, RULES, STEP } from './config.js';
import { LEVELS } from './levels.js';
import { ACT_CONFIRM, ACT_PAUSE, ACT_RESTART, ACT_SMOKE, createInput } from './input.js';
import { createRenderer, losClear, SCREEN_CAUGHT, SCREEN_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { sfx } from './audio.js';
import { stageShot } from './shots.js';

export const EV_CAUGHT = 1;
export const EV_CLEAR = 2;
export const EV_WIN = 4;

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function hitsCover(x, y, r, cover) {
  for (const c of cover) {
    const nx = Math.max(c.x, Math.min(x, c.x + c.w));
    const ny = Math.max(c.y, Math.min(y, c.y + c.h));
    if (Math.hypot(x - nx, y - ny) < r) return true;
  }
  return false;
}

export function createGame() {
  const state = {
    levelIndex: 0,
    level: LEVELS[0],
    player: { x: 90, y: 640, sneak: false },
    guards: [],
    cameras: [],
    loot: [],
    lootTaken: 0,
    hasLedger: false,
    ledgerNeeded: false,
    score: 0,
    timeLeft: LEVELS[0].time,
    alarm: 0,
    coins: RULES.coins,
    smokesLeft: RULES.smokes,
    smokes: [],
    lure: null,
    lockedPinged: false,
  };

  function reset(levelIndex, keepScore) {
    state.levelIndex = levelIndex;
    state.level = LEVELS[levelIndex];
    state.player.x = state.level.start.x;
    state.player.y = state.level.start.y;
    state.player.sneak = false;
    state.guards = state.level.guards.map((g) => ({
      x: g.path[0][0],
      y: g.path[0][1],
      angle: 0,
      wp: 1 % g.path.length,
      path: g.path,
      wait: 0,
      seeing: false,
      lured: false,
    }));
    state.cameras = state.level.cameras.map((c) => ({
      x: c.x,
      y: c.y,
      sweepMin: c.sweepMin,
      sweepMax: c.sweepMax,
      phase: c.phase,
      t: c.phase,
      angle: c.sweepMin,
      seeing: false,
      frozen: false,
    }));
    state.loot = state.level.loot.map((l) => ({ x: l.x, y: l.y, kind: l.kind, taken: false }));
    state.lootTaken = 0;
    state.hasLedger = false;
    state.ledgerNeeded = state.loot.some((l) => l.kind === 'ledger');
    state.score = keepScore || 0;
    state.timeLeft = state.level.time;
    state.alarm = 0;
    state.coins = RULES.coins;
    state.smokesLeft = RULES.smokes;
    state.smokes = [];
    state.lure = null;
    state.lockedPinged = false;
  }

  function throwLure(x, y) {
    if (state.coins <= 0) return false;
    state.coins -= 1;
    state.lure = { x, y, t: RULES.lureSeconds };
    sfx('coin');
    return true;
  }

  function useSmoke() {
    if (state.smokesLeft <= 0) return false;
    state.smokesLeft -= 1;
    state.smokes.push({ x: state.player.x, y: state.player.y, r: RULES.smokeRadius, t: RULES.smokeSeconds });
    sfx('smoke');
    return true;
  }

  function inSmoke(x, y) {
    return state.smokes.some((s) => Math.hypot(x - s.x, y - s.y) < s.r);
  }

  function eyeSees(ex, ey, angle, range, halfAngle) {
    const dx = state.player.x - ex;
    const dy = state.player.y - ey;
    const dist = Math.hypot(dx, dy);
    if (dist > range) return -1;
    if (inSmoke(state.player.x, state.player.y)) return -1;
    const ang = Math.atan2(dy, dx);
    if (Math.abs(angleDiff(ang, angle)) > halfAngle) return -1;
    if (!losClear(ex, ey, state.player.x, state.player.y, state.level.cover)) return -1;
    return dist / range; // 0 = point blank, 1 = edge of range
  }

  function step(dt, move) {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.alarm = 1;
      sfx('alarm');
      return EV_CAUGHT;
    }
    // player movement with cover collision (axis separated)
    const speed = move.sneak ? PLAYER.sneakSpeed : PLAYER.speed;
    state.player.sneak = move.sneak;
    const len = Math.hypot(move.x, move.y) || 1;
    const vx = (move.x / len) * speed * dt * (move.x || move.y ? 1 : 0);
    const vy = (move.y / len) * speed * dt * (move.x || move.y ? 1 : 0);
    const nx = Math.max(PLAYER.radius, Math.min(FIELD.width - PLAYER.radius, state.player.x + vx));
    if (!hitsCover(nx, state.player.y, PLAYER.radius, state.level.cover)) state.player.x = nx;
    const ny = Math.max(PLAYER.radius, Math.min(FIELD.height - PLAYER.radius, state.player.y + vy));
    if (!hitsCover(state.player.x, ny, PLAYER.radius, state.level.cover)) state.player.y = ny;

    // lure + smoke lifetimes
    if (state.lure) {
      state.lure.t -= dt;
      if (state.lure.t <= 0) state.lure = null;
    }
    state.smokes = state.smokes.filter((s) => (s.t -= dt) > 0);

    // guards: patrol, or turn toward the lure
    for (const g of state.guards) {
      g.lured = false;
      if (state.lure && Math.hypot(state.lure.x - g.x, state.lure.y - g.y) < 340) {
        const want = Math.atan2(state.lure.y - g.y, state.lure.x - g.x);
        g.angle += Math.max(-2.4 * dt, Math.min(2.4 * dt, angleDiff(want, g.angle)));
        g.lured = true;
        continue;
      }
      if (g.wait > 0) { g.wait -= dt; continue; }
      const target = g.path[g.wp];
      const dx = target[0] - g.x;
      const dy = target[1] - g.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        g.wp = (g.wp + 1) % g.path.length;
        g.wait = GUARD.pauseAtWaypoint;
      } else {
        const want = Math.atan2(dy, dx);
        g.angle += Math.max(-3 * dt, Math.min(3 * dt, angleDiff(want, g.angle)));
        g.x += (dx / dist) * GUARD.speed * dt;
        g.y += (dy / dist) * GUARD.speed * dt;
      }
    }

    // cameras: smooth ping-pong sweep between sweepMin and sweepMax
    for (const cam of state.cameras) {
      if (cam.frozen) continue;
      cam.t += dt;
      const span = cam.sweepMax - cam.sweepMin;
      const cycle = (span / CAMERA.sweepSpeed) * 2;
      const ph = (cam.t % cycle) / cycle; // 0..1
      const tri = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      cam.angle = cam.sweepMin + span * tri;
    }

    // alarm: any eye (guard or camera) with clear sight fills the meter
    let seen = false;
    let closest = 1;
    let byCameraOnly = true;
    for (const g of state.guards) {
      const frac = eyeSees(g.x, g.y, g.angle, GUARD.viewRange, GUARD.viewHalfAngle);
      g.seeing = frac >= 0;
      if (g.seeing) {
        seen = true;
        byCameraOnly = false;
        closest = Math.min(closest, frac);
      }
    }
    for (const cam of state.cameras) {
      const frac = eyeSees(cam.x, cam.y, cam.angle, CAMERA.viewRange, CAMERA.viewHalfAngle);
      cam.seeing = frac >= 0;
      if (cam.seeing) {
        seen = true;
        closest = Math.min(closest, frac);
      }
    }
    if (seen) {
      // sneaking shrinks your profile: the meter fills much slower while Shift is held
      const profile = move.sneak ? RULES.sneakFactor : 1;
      const rate = RULES.alarmFill * profile * (1.25 - closest) * (byCameraOnly ? RULES.cameraFactor : 1);
      state.alarm += rate * dt;
      if (state.alarm > 0.55 && state.alarm - rate * dt <= 0.55) sfx('alert');
    } else {
      state.alarm -= RULES.alarmDecay * dt;
    }
    state.alarm = Math.max(0, Math.min(1, state.alarm));
    if (state.alarm >= 1) {
      sfx('alarm');
      return EV_CAUGHT;
    }

    // loot
    for (const item of state.loot) {
      if (!item.taken && Math.hypot(item.x - state.player.x, item.y - state.player.y) < 24) {
        item.taken = true;
        state.lootTaken += 1;
        if (item.kind === 'ledger') {
          state.hasLedger = true;
          state.score += RULES.ledgerScore;
          sfx('ledger');
        } else {
          state.score += RULES.goldScore;
          sfx('gold');
        }
      }
    }

    // exit: the service door. In the Vault Core it stays locked
    // until the Sunken Ledger is in your bag.
    const ex = state.level.exit;
    const onExit = state.player.x > ex.x && state.player.x < ex.x + ex.w && state.player.y > ex.y && state.player.y < ex.y + ex.h;
    if (onExit && state.ledgerNeeded && !state.hasLedger) {
      if (!state.lockedPinged) {
        state.lockedPinged = true;
        sfx('locked');
      }
    } else if (!onExit) {
      state.lockedPinged = false;
    } else {
      state.score += RULES.levelBonus + Math.floor(state.timeLeft) * RULES.timeBonusPerSecond;
      if (state.levelIndex >= LEVELS.length - 1) {
        sfx('win');
        return EV_WIN;
      }
      sfx('clear');
      return EV_CLEAR;
    }
    return 0;
  }

  reset(0, 0);
  return { state, reset, step, throwLure, useSmoke };
}

// ---- boot ----
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch { return 0; }
}
function saveBest(v) {
  try { window.localStorage.setItem(BEST_KEY, String(v)); } catch { /* private window */ }
}

if (shot) {
  const scene = stageShot(shot, game);
  let painted = 0;
  const paint = () => {
    renderer.draw(game.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  };
  requestAnimationFrame(paint);
} else {
  const input = createInput(canvas, (cx, cy) => renderer.toField(cx, cy));
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  const MAX_FRAME = 0.25;

  function announce(msg) { status.textContent = msg; }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const actions = input.takeActions();
    const click = input.takeClick();

    if (screen === SCREEN_TITLE) {
      if (actions & ACT_CONFIRM) { game.reset(0, 0); screen = SCREEN_PLAY; announce('Playing. ' + game.state.level.hint); }
    } else if (screen === SCREEN_PLAY) {
      if (actions & ACT_PAUSE) { screen = SCREEN_PAUSED; announce('Paused.'); }
      else if (actions & ACT_RESTART) { game.reset(game.state.levelIndex, game.state.score); announce('Floor restarted.'); }
      else {
        if (actions & ACT_SMOKE) game.useSmoke();
        if (click) game.throwLure(click.x, click.y);
        while (accumulator >= STEP && screen === SCREEN_PLAY) {
          const ev = game.step(STEP, input.move());
          accumulator -= STEP;
          if (ev & EV_CAUGHT) { screen = SCREEN_CAUGHT; announce('Alarm tripped! Press R to retry.'); }
          else if (ev & EV_CLEAR) { screen = SCREEN_CLEAR; announce('Floor clear.'); }
          else if (ev & EV_WIN) {
            screen = SCREEN_WIN;
            if (game.state.score > best) { best = game.state.score; saveBest(best); }
            announce('Ledger stolen. Score ' + game.state.score);
          }
        }
      }
    } else if (screen === SCREEN_PAUSED) {
      if (actions & (ACT_PAUSE | ACT_CONFIRM)) { screen = SCREEN_PLAY; announce('Playing.'); }
      accumulator = 0;
    } else if (screen === SCREEN_CAUGHT) {
      if (actions & (ACT_RESTART | ACT_CONFIRM)) { game.reset(game.state.levelIndex, game.state.score); screen = SCREEN_PLAY; announce('Playing.'); }
      accumulator = 0;
    } else if (screen === SCREEN_CLEAR) {
      if (actions & ACT_CONFIRM) { game.reset(game.state.levelIndex + 1, game.state.score); screen = SCREEN_PLAY; announce('Playing. ' + game.state.level.hint); }
      accumulator = 0;
    } else if (screen === SCREEN_WIN) {
      if (actions & ACT_CONFIRM) { game.reset(0, 0); screen = SCREEN_PLAY; announce('Playing.'); }
      accumulator = 0;
    }
    renderer.draw(game.state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) { screen = SCREEN_PAUSED; announce('Paused.'); }
  });
  announce('Vault of the Sunken Ledger. Press Enter or click to start.');
  requestAnimationFrame(frame);
}
