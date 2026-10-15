import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLocalUri, assertImageSize, displayName, imageExtension, normalizeImageMime, parseSharedImage, MAX_IMAGE_BYTES } from '../src/features/photos/photo-policy.ts';
import { ND_STYLES, requireAvailableProfile } from '../src/features/styles/catalog.ts';

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
test('unimplemented profiles cannot be exported as working styles', () => {
  assert.doesNotThrow(() => requireAvailableProfile('original'));
  for (const style of ND_STYLES) {
    assert.equal(style.available, false);
    assert.throws(() => requireAvailableProfile(style.id), /not implemented/);
  }
  assert.throws(() => requireAvailableProfile('unknown'));
});
