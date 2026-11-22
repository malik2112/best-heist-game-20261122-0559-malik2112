// Renderer: bank floors, cover, vision cones (raycast-clipped by cover),
// wall cameras with sweeping cones, gold bars, the Sunken Ledger, the
// service door, actors, HUD with the ALARM meter, and overlays.
// Pure drawing from state — no game rules live here.

import { CAMERA, FIELD, FONT, GUARD, PALETTE } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_WIN = 'win';

function rayRect(ox, oy, dx, dy, r) {
  let tmin = 0;
  let tmax = Infinity;
  if (Math.abs(dx) < 1e-9) {
    if (ox < r.x || ox > r.x + r.w) return Infinity;
  } else {
    let t1 = (r.x - ox) / dx;
    let t2 = (r.x + r.w - ox) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return Infinity;
  }
  if (Math.abs(dy) < 1e-9) {
    if (oy < r.y || oy > r.y + r.h) return Infinity;
  } else {
    let t1 = (r.y - oy) / dy;
    let t2 = (r.y + r.h - oy) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return Infinity;
  }
  return tmin;
}

export function losClear(ax, ay, bx, by, cover) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-6) return true;
  const ux = dx / dist;
  const uy = dy / dist;
  for (const r of cover) {
    const t = rayRect(ax, ay, ux, uy, r);
    if (t < dist - 2) return false;
  }
  return true;
}

export function conePolygon(gx, gy, angle, halfAngle, range, cover) {
  const pts = [[gx, gy]];
  const rays = 28;
  for (let i = 0; i <= rays; i += 1) {
    const a = angle - halfAngle + (2 * halfAngle * i) / rays;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let best = range;
    for (const r of cover) {
      const t = rayRect(gx, gy, dx, dy, r);
      if (t < best) best = t;
    }
    if (dx > 0) best = Math.min(best, (FIELD.width - gx) / dx);
    if (dx < 0) best = Math.min(best, -gx / dx);
    if (dy > 0) best = Math.min(best, (FIELD.height - gy) / dy);
    if (dy < 0) best = Math.min(best, -gy / dy);
    pts.push([gx + dx * best, gy + dy * best]);
  }
  return pts;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx, r) {
  if (r.kind === 'pillar') {
    ctx.fillStyle = PALETTE.pillar;
    roundRect(ctx, r.x, r.y, r.w, r.h, 4);
    ctx.fill();
    ctx.fillStyle = PALETTE.pillarTop;
    roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 3);
    ctx.fill();
  } else if (r.kind === 'crate') {
    ctx.fillStyle = PALETTE.crate;
    roundRect(ctx, r.x, r.y, r.w, r.h, 4);
    ctx.fill();
    ctx.strokeStyle = PALETTE.crateTop;
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x + 5, r.y + 5, r.w - 10, r.h - 10);
    ctx.beginPath();
    ctx.moveTo(r.x + 5, r.y + 5);
    ctx.lineTo(r.x + r.w - 5, r.y + r.h - 5);
    ctx.moveTo(r.x + r.w - 5, r.y + 5);
    ctx.lineTo(r.x + 5, r.y + r.h - 5);
    ctx.stroke();
  } else if (r.kind === 'counter') {
    ctx.fillStyle = PALETTE.counter;
    roundRect(ctx, r.x, r.y, r.w, r.h, 4);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, 10, 3);
    ctx.fill();
  } else {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(r.x, r.y, r.w, 6);
  }
}

function drawCone(ctx, poly, fill) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i += 1) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawGold(ctx, x, y) {
  ctx.fillStyle = PALETTE.goldDark;
  roundRect(ctx, x - 13, y - 8, 26, 16, 3);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  roundRect(ctx, x - 11, y - 6, 22, 9, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x - 8, y - 4, 8, 3);
}

function drawLedger(ctx, x, y) {
  ctx.fillStyle = '#1d4d33';
  roundRect(ctx, x - 15, y - 11, 30, 22, 3);
  ctx.fill();
  ctx.fillStyle = PALETTE.ledger;
  roundRect(ctx, x - 12, y - 8, 24, 16, 2);
  ctx.fill();
  ctx.fillStyle = '#123524';
  ctx.fillRect(x - 8, y - 4, 16, 2);
  ctx.fillRect(x - 8, y, 16, 2);
  ctx.fillRect(x - 8, y + 4, 10, 2);
  ctx.strokeStyle = PALETTE.ledger;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 21, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCamera(ctx, cam) {
  ctx.fillStyle = '#22252e';
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8ad8ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  const lx = cam.x + Math.cos(cam.angle) * 8;
  const ly = cam.y + Math.sin(cam.angle) * 8;
  ctx.fillStyle = cam.seeing ? '#ff5a4e' : '#8ad8ff';
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `bold 9px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('CAM', cam.x, cam.y - 16);
}

function drawGuard(ctx, g) {
  ctx.fillStyle = PALETTE.guardDark;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guard;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 10, 0, Math.PI * 2);
  ctx.fill();
  const nx = g.x + Math.cos(g.angle) * 11;
  const ny = g.y + Math.sin(g.angle) * 11;
  ctx.fillStyle = '#f2d5c4';
  ctx.beginPath();
  ctx.arc(nx, ny, 4.5, 0, Math.PI * 2);
  ctx.fill();
  if (g.seeing) {
    ctx.fillStyle = '#ff5a4e';
    ctx.font = `bold 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - 20);
  } else if (g.lured) {
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 14px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('?', g.x, g.y - 20);
  }
}

function drawPlayer(ctx, p) {
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.playerTrim;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.playerTrim;
  ctx.beginPath();
  ctx.arc(p.x, p.y - 2, 4, 0, Math.PI * 2);
  ctx.fill();
  if (p.sneak) {
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `10px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('sneak', p.x, p.y + 26);
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let ox = 0;
  let oy = 0;

  function fit() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    ox = (canvas.width - FIELD.width * scale) / 2;
    oy = (canvas.height - FIELD.height * scale) / 2;
  }
  window.addEventListener('resize', fit);
  fit();

  function toField(cx, cy) {
    return { x: (cx - ox) / scale, y: (cy - oy) / scale };
  }

  function drawHUD(state, best) {
    const lv = state.level;
    ctx.fillStyle = PALETTE.panel;
    ctx.fillRect(0, 0, FIELD.width, 64);
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `bold 19px ${FONT}`;
    ctx.fillText(`VAULT OF THE SUNKEN LEDGER — ${lv.name}`, 16, 26);
    ctx.font = `13px ${FONT}`;
    ctx.fillStyle = PALETTE.dim;
    const ledgerNote = state.ledgerNeeded
      ? (state.hasLedger ? 'Ledger in bag — get to the service door!' : 'Take the Sunken Ledger, then reach the service door.')
      : 'Grab gold bars, then reach the service door.';
    ctx.fillText(ledgerNote, 16, 48);

    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `bold 18px ${FONT}`;
    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    ctx.fillText(`Score ${state.score}   Best ${best}   Time ${mins}:${String(secs).padStart(2, '0')}`, FIELD.width - 16, 26);
    ctx.font = `13px ${FONT}`;
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(`Loot ${state.lootTaken}/${state.loot.length}   Coins ${state.coins}   Smoke ${state.smokesLeft}   WASD move · Shift sneak · Click coin · Space smoke · P pause · R restart`, FIELD.width - 16, 48);

    // ALARM meter — the heart of the HUD
    const mx = FIELD.width / 2 - 190;
    const my = 72;
    const mw = 380;
    const mh = 20;
    ctx.fillStyle = 'rgba(12,13,20,0.85)';
    roundRect(ctx, mx - 8, my - 22, mw + 16, mh + 32, 6);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = state.alarm > 0.66 ? PALETTE.alarm : state.alarm > 0.33 ? PALETTE.alarmMid : PALETTE.ink;
    ctx.font = `bold 13px ${FONT}`;
    ctx.fillText(state.alarm > 0.66 ? 'ALARM — BREAK LINE OF SIGHT!' : 'ALARM', FIELD.width / 2, my - 6);
    ctx.fillStyle = '#3a3f4d';
    roundRect(ctx, mx, my, mw, mh, 5);
    ctx.fill();
    const fillW = Math.max(0, Math.min(1, state.alarm)) * mw;
    if (fillW > 2) {
      ctx.fillStyle = state.alarm > 0.66 ? PALETTE.alarm : state.alarm > 0.33 ? PALETTE.alarmMid : PALETTE.ok;
      roundRect(ctx, mx, my, fillW, mh, 5);
      ctx.fill();
    }
    ctx.strokeStyle = PALETTE.dim;
    ctx.lineWidth = 1;
    roundRect(ctx, mx, my, mw, mh, 5);
    ctx.stroke();
  }

  function overlay(title, lines, titleColor) {
    ctx.fillStyle = 'rgba(8, 9, 14, 0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor || PALETTE.ink;
    ctx.font = `bold 52px ${FONT}`;
    ctx.fillText(title, FIELD.width / 2, 250);
    ctx.font = `17px ${FONT}`;
    ctx.fillStyle = PALETTE.ink;
    lines.forEach((line, i) => ctx.fillText(line, FIELD.width / 2, 300 + i * 28));
  }

  function draw(state, screen, best) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, ox, oy);

    const lv = state.level;
    // floor: marble tiles + a runner rug
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.floorTile;
    for (let y = 0; y < FIELD.height; y += 80) {
      for (let x = ((y / 80) % 2) * 80; x < FIELD.width; x += 160) {
        ctx.fillRect(x, y, 80, 80);
      }
    }
    ctx.fillStyle = PALETTE.rug;
    ctx.fillRect(240, 300, 800, 120);

    // exit: service door
    const ex = lv.exit;
    const locked = state.ledgerNeeded && !state.hasLedger;
    ctx.fillStyle = locked ? PALETTE.exitLocked : PALETTE.exit;
    roundRect(ctx, ex.x, ex.y, ex.w, ex.h, 6);
    ctx.fill();
    ctx.fillStyle = '#0e2417';
    ctx.font = `bold 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(locked ? 'LOCKED' : 'EXIT', ex.x + ex.w / 2, ex.y + ex.h / 2 - 2);
    ctx.font = `10px ${FONT}`;
    ctx.fillText('service door', ex.x + ex.w / 2, ex.y + ex.h / 2 + 14);

    // camera cones first (under guard cones), then guard cones
    for (const cam of state.cameras) {
      const poly = conePolygon(cam.x, cam.y, cam.angle, CAMERA.viewHalfAngle, CAMERA.viewRange, lv.cover);
      drawCone(ctx, poly, cam.seeing ? PALETTE.camConeAlert : PALETTE.camCone);
    }
    for (const g of state.guards) {
      const poly = conePolygon(g.x, g.y, g.angle, GUARD.viewHalfAngle, GUARD.viewRange, lv.cover);
      drawCone(ctx, poly, g.seeing ? PALETTE.coneAlert : PALETTE.cone);
    }

    for (const r of lv.cover) drawCover(ctx, r);

    // loot
    for (const item of state.loot) {
      if (item.taken) continue;
      if (item.kind === 'ledger') drawLedger(ctx, item.x, item.y);
      else drawGold(ctx, item.x, item.y);
    }

    // coin lure
    if (state.lure) {
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath();
      ctx.arc(state.lure.x, state.lure.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245,197,66,0.5)';
      ctx.beginPath();
      ctx.arc(state.lure.x, state.lure.y, 14 + Math.sin(state.lure.t * 9) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // smoke
    for (const s of state.smokes) {
      const a = Math.min(0.55, s.t / 2);
      ctx.fillStyle = `rgba(190,196,210,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const cam of state.cameras) drawCamera(ctx, cam);
    for (const g of state.guards) drawGuard(ctx, g);
    drawPlayer(ctx, state.player);

    drawHUD(state, best);

    if (screen === SCREEN_TITLE) {
      overlay('VAULT OF THE SUNKEN LEDGER', [
        'A three-floor bank heist. Guards patrol with vision cones;',
        'wall cameras sweep their own. Either eye on you fills the ALARM meter —',
        'full meter, alarm trips, floor restarts. Cover blocks sight: stay behind pillars.',
        '',
        'WASD / arrows move · Shift sneak (alarm fills slower) · Click throws a coin lure',
        'Space drops smoke (limited) · P pause · R restart',
        'Steal gold bars. In the Vault Core, take the Sunken Ledger — the service door',
        'stays LOCKED until it is in your bag.',
        '',
        'Press Enter or click to start the heist.',
      ], PALETTE.gold);
    } else if (screen === SCREEN_PAUSED) {
      overlay('PAUSED', ['Press P or Enter to keep sneaking.']);
    } else if (screen === SCREEN_CAUGHT) {
      overlay('ALARM TRIPPED!', [
        'The guards flood the floor. The job restarts on this floor.',
        'Press R or Enter to try the floor again.',
      ], PALETTE.alarm);
    } else if (screen === SCREEN_CLEAR) {
      overlay('FLOOR CLEAR', [
        `Score ${state.score} — the next floor is deeper and better watched.`,
        'Press Enter to go down.',
      ], PALETTE.ok);
    } else if (screen === SCREEN_WIN) {
      overlay('LEDGER STOLEN!', [
        `You walked out with the Sunken Ledger. Final score ${state.score}.`,
        `Best ${Math.max(best, state.score)}. Press Enter to run the heist again.`,
      ], PALETTE.gold);
    }
  }

  return { draw, toField };
}
