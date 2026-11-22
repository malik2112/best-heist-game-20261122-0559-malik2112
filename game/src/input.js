// Keyboard + mouse input. Movement keys are held state; one-shot keys
// (smoke, pause, restart, confirm) queue as action bits the loop drains.
// A mouse click queues a coin-lure throw at that field position.

export const ACT_SMOKE = 1;
export const ACT_PAUSE = 2;
export const ACT_RESTART = 4;
export const ACT_CONFIRM = 8;

export function createInput(canvas, toField) {
  const held = new Set();
  let actions = 0;
  let click = null;

  const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  window.addEventListener('keydown', (e) => {
    if (MOVE_KEYS.includes(e.code) || e.code === 'Space') e.preventDefault();
    if (e.repeat) return;
    held.add(e.code);
    if (e.code === 'Space') actions |= ACT_SMOKE;
    if (e.code === 'KeyP' || e.code === 'Escape') actions |= ACT_PAUSE;
    if (e.code === 'KeyR') actions |= ACT_RESTART;
    if (e.code === 'Enter') actions |= ACT_CONFIRM;
  });
  window.addEventListener('keyup', (e) => held.delete(e.code));
  window.addEventListener('blur', () => held.clear());

  canvas.addEventListener('pointerdown', (e) => {
    const p = toField(e.clientX, e.clientY);
    click = { x: p.x, y: p.y };
    actions |= ACT_CONFIRM;
  });

  function move() {
    let x = 0;
    let y = 0;
    if (held.has('KeyA') || held.has('ArrowLeft')) x -= 1;
    if (held.has('KeyD') || held.has('ArrowRight')) x += 1;
    if (held.has('KeyW') || held.has('ArrowUp')) y -= 1;
    if (held.has('KeyS') || held.has('ArrowDown')) y += 1;
    const sneak = held.has('ShiftLeft') || held.has('ShiftRight');
    return { x, y, sneak };
  }

  function takeActions() {
    const a = actions;
    actions = 0;
    return a;
  }

  function takeClick() {
    const c = click;
    click = null;
    return c;
  }

  return { move, takeActions, takeClick };
}
