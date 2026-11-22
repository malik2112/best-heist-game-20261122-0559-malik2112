// Vault of the Sunken Ledger — hand-in program (Node 22, stdlib only).
// The game is the game/ folder beside this file: plain static files a
// desktop browser loads offline (game/index.html plus its ES modules, no
// library, no network request). This program copies game/ and
// screenshots/ to /output and writes /output/dossier.json, the summary
// the judge reads, using buildDossier from the vendored make.fun library.
//
// Play it locally with `node serve.ts`, then open the printed address.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's own (reference/gate.json): text_max_bytes is
// the only one that shapes the dossier bytes; the rest refuse an entry
// the scorer would refuse anyway (over 4 screenshots or one over 256 KiB;
// over 993 files in game/ or 48 MiB of game files in all, or a path
// under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
