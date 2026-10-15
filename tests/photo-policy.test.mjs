import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLocalUri, assertImageSize, displayName, imageExtension, normalizeImageMime, parseSharedImage, MAX_IMAGE_BYTES } from '../src/features/photos/photo-policy.ts';
import { ND_STYLES, requireAvailableProfile, getStyleMatrix, createEditRecipe } from '../src/features/styles/catalog.ts';

test('accepts a local Android image share', () => {
  assert.deepEqual(parseSharedImage([{ shareType: 'image', mimeType: 'image/jpeg', value: 'content://photos/123' }]), { uri: 'content://photos/123', mimeType: 'image/jpeg' });
});
test('accepts a file-based PNG share', () => {
  assert.equal(parseSharedImage([{ shareType: 'file', value: 'file:///cache/test.png' }]).mimeType, 'image/png');
});
test('rejects batches rather than silently dropping photos', () => {
  assert.throws(() => parseSharedImage([{}, {}]), /one photo/);
  assert.throws(() => parseSharedImage([]), /one photo/);
});
test('rejects non-image shares', () => {
  for (const shareType of ['text', 'url', 'video', 'audio', undefined]) {
    assert.throws(() => parseSharedImage([{ shareType, value: 'content://photos/123', mimeType: 'image/jpeg' }]));
  }
});
test('rejects remote URLs, arbitrary paths, and executable schemes', () => {
  for (const uri of ['https://example.com/a.jpg', 'http://example.com/a.png', 'javascript:alert(1)', '/etc/passwd', 'data:image/png;base64,AAAA', 'file://remote/a.jpg', 'content://', '']) {
    assert.throws(() => assertLocalUri(uri));
  }
});
test('accepts local file and content URIs', () => {
  assert.doesNotThrow(() => assertLocalUri('file:///cache/a%20b.jpg'));
  assert.doesNotThrow(() => assertLocalUri('content://media/external/images/123'));
});
test('normalizes supported MIME types and extension fallbacks', () => {
  assert.equal(normalizeImageMime('IMAGE/JPEG; charset=binary'), 'image/jpeg');
  assert.equal(normalizeImageMime('image/jpg'), 'image/jpeg');
  assert.equal(normalizeImageMime(null, 'snapseed.JPG'), 'image/jpeg');
  assert.equal(normalizeImageMime('image/*', 'photo.heic'), 'image/heic');
  assert.equal(imageExtension('image/webp'), 'webp');
});
test('rejects unsupported images instead of lying about their format', () => {
  for (const mime of ['image/gif', 'image/x-adobe-dng', 'video/mp4', 'text/html', '']) assert.throws(() => imageExtension(mime));
  assert.throws(() => normalizeImageMime('text/html', 'photo.jpg'));
});
test('bounds readable image size', () => {
  assert.doesNotThrow(() => assertImageSize(1));
  assert.doesNotThrow(() => assertImageSize(MAX_IMAGE_BYTES));
  for (const value of [0, -1, NaN, Infinity, MAX_IMAGE_BYTES + 1]) assert.throws(() => assertImageSize(value));
});
test('sanitizes display names without using them as output paths', () => {
  assert.equal(displayName('../../secret.jpg', 'Photo.jpg'), 'secret.jpg');
  assert.equal(displayName('C:\\photos\\photo.jpg', 'Photo.jpg'), 'photo.jpg');
  assert.equal(displayName('a\u202eb.jpg', 'Photo.jpg'), 'ab.jpg');
  assert.equal(displayName(undefined, 'Photo.jpg'), 'Photo.jpg');
  assert.equal(displayName('a'.repeat(200), 'Photo.jpg').length, 120);
});
test('supported profiles can be used as working styles', () => {
  assert.doesNotThrow(() => requireAvailableProfile('original'));
  for (const style of ND_STYLES) {
    assert.equal(style.available, true);
    assert.doesNotThrow(() => requireAvailableProfile(style.id));
  }
  assert.throws(() => requireAvailableProfile('unknown'), /not available/);
});

test('generates and bounds valid style color matrices', () => {
  const original = getStyleMatrix('original', 1);
  assert.equal(original.length, 20);
  assert.equal(original[0], 1);

  const natural = getStyleMatrix('natural', 1);
  assert.equal(natural.length, 20);
  assert.equal(natural[0], 1.06);

  const naturalZero = getStyleMatrix('natural', 0);
  assert.deepEqual(naturalZero, original);

  const naturalHalf = getStyleMatrix('natural', 0.5);
  assert.equal(Number(naturalHalf[0].toFixed(3)), 1.03);

  const recipe = createEditRecipe('test-id', 'natural', 1.5, 0.5, -0.2, 0.3);
  assert.equal(recipe.strength, 1.0);
  assert.equal(recipe.profileId, 'natural');
  assert.equal(recipe.tone, 0.5);
  assert.equal(recipe.warmth, -0.2);
  assert.equal(recipe.vignette, 0.3);
});

test('supports iOS Photographic Styles and Leica camera profiles', () => {
  const iosRich = getStyleMatrix('ios-rich-contrast', 1);
  assert.equal(iosRich.length, 20);
  // Rich contrast has higher contrast and lower shadow offset
  assert.ok(iosRich[0] > 1.1);
  assert.ok(iosRich[4] < 0);

  const leicaAuth = getStyleMatrix('leica-authentic', 1);
  assert.equal(leicaAuth.length, 20);

  const leicaMono = getStyleMatrix('leica-mono', 1);
  assert.equal(leicaMono.length, 20);
  // Monochrom has equal R, G, B weights per channel
  assert.equal(leicaMono[0], leicaMono[5]);
  assert.equal(leicaMono[5], leicaMono[10]);

  // Fine-tuning adjustments shift values predictably
  const warm = getStyleMatrix('ios-standard', 1, 0, 0.5);
  const cool = getStyleMatrix('ios-standard', 1, 0, -0.5);
  assert.ok(warm[0] > cool[0]); // warmer has more red
  assert.ok(warm[12] < cool[12]); // warmer has less blue
});


