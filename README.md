# best-heist-game-20261122-0559-malik2112

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/malik2112/best-heist-game-20261122-0559-malik2112/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/malik2112/best-heist-game-20261122-0559-malik2112/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Vault of the Sunken Ledger** — a top-down bank heist on a 1280×720 canvas, three floors deep (Lobby Marble, Camera Gallery, Vault Core). Guards patrol with raycast vision cones clipped by pillars, crates and counters; wall cameras sweep their own cones back and forth. Either eye on you fills the ALARM meter — full meter, the alarm trips and the floor restarts. Sneak with Shift (the meter fills at about a third of the rate), throw a coin lure with a click to turn a guard's head, drop smoke with Space to break sight lines. Steal gold bars on every floor, take the Sunken Ledger in the Vault Core — the service door stays LOCKED until it is in your bag — then walk out. Timer, score and best score on the HUD; P pauses, R restarts the floor. WebAudio chimes, no assets, no network: plain ES modules under `game/`.

Controls: WASD / arrows move · Shift sneak · Click coin lure · Space smoke · P pause · R restart · Enter confirm.

Scoring: gold bar 150, Sunken Ledger 900, floor clear 300 plus 4 per second left on the clock. Fill the ALARM meter or run out of time and the floor restarts.

## Run it

```sh
node serve.ts
```

Then open the printed localhost address in a desktop browser. Screenshot scenes: `?shot=start`, `?shot=play`, `?shot=level2`, `?shot=win`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=pwfn5nwa&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
