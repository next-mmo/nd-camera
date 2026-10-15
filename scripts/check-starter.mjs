import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { getExpoTemplateFiles } from '../vendor/universal-apps/expo.mjs';
const root = new URL('../', import.meta.url);
const read = (name) => readFileSync(new URL(name, root));
const meta = JSON.parse(read('universal-starter.json'));
for (const [name, expected] of [
  ['vendor/universal-apps/expo.mjs', meta.sourceBlobSha],
  ['vendor/universal-apps/LICENSE', meta.licenseBlobSha],
]) {
  const bytes = read(name);
  const actual = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  assert.equal(actual, expected, `Upstream source was modified: ${name}`);
}
const generated = getExpoTemplateFiles('nd-camera');
assert.equal(generated.size, 9);
for (const name of ['index.js', 'babel.config.js', 'src/uniwind-env.d.ts']) {
  assert.equal(read(name).toString(), generated.get(name), `Unexpected starter drift: ${name}`);
}
const app = JSON.parse(read('app.json')).expo;
const pkg = JSON.parse(read('package.json'));
assert.equal(app.name, 'ND Camera');
assert.equal(app.slug, 'nd-camera');
assert.equal(pkg.dependencies.react, '19.2.3');
assert.equal(pkg.dependencies['react-native'], '0.86.3');
assert.match(pkg.dependencies.expo, /^57\./);
assert(!('newArchEnabled' in app), 'Expo 57 is New Architecture only');
assert(!Object.keys(pkg.dependencies).some((name) => name.startsWith('@package/')));
const share = app.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-sharing')[1];
assert.deepEqual(share.android.singleShareMimeTypes, ['image/*']);
assert.deepEqual(share.android.multipleShareMimeTypes, []);
assert.equal(share.ios.enabled, false);
assert(app.android.blockedPermissions.includes('android.permission.RECORD_AUDIO'));
console.log(`Verified Universal Apps ${meta.commit.slice(0, 7)}, source hashes, and ND app configuration.`);
