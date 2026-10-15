import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SNAPSEED_QR_PRESETS } from '../src/features/snapseed/catalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, '../assets/snapseed');

test('snapseed catalog has curated presets across all photography genres', () => {
  assert.ok(Array.isArray(SNAPSEED_QR_PRESETS));
  assert.strictEqual(SNAPSEED_QR_PRESETS.length, 12);

  const categories = new Set(SNAPSEED_QR_PRESETS.map((p) => p.category));
  assert.ok(categories.has('film'));
  assert.ok(categories.has('portrait'));
  assert.ok(categories.has('bw'));
  assert.ok(categories.has('aesthetic'));
});

test('every snapseed preset has complete metadata, recipe steps, and asset file', () => {
  const ids = new Set();
  for (const preset of SNAPSEED_QR_PRESETS) {
    assert.ok(preset.id && typeof preset.id === 'string');
    assert.ok(!ids.has(preset.id), `Duplicate preset id: ${preset.id}`);
    ids.add(preset.id);

    assert.ok(preset.title && typeof preset.title === 'string');
    assert.ok(preset.tagline && typeof preset.tagline === 'string');
    assert.ok(preset.description && typeof preset.description === 'string');
    assert.ok(preset.bestFor && typeof preset.bestFor === 'string');
    assert.ok(Array.isArray(preset.recipeHighlights));
    assert.ok(preset.recipeHighlights.length >= 2);

    const assetFilename = `${preset.id.replace(/-/g, '_')}.jpg`;
    const assetPath = path.join(assetsDir, assetFilename);
    assert.ok(fs.existsSync(assetPath), `Asset file missing: ${assetFilename}`);
    const stat = fs.statSync(assetPath);
    assert.ok(stat.size > 10000, `Asset file is too small: ${assetFilename} (${stat.size} bytes)`);
  }
});
