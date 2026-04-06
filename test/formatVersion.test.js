import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js'

describe('formatVersion', () => {
  it('pads a shorter version with two zeros', () => {
    assert.strictEqual(versionRequest.formatVersion('2'), '2.0.0');
  });

  it('pads a shorter version with one zero', () => {
    assert.strictEqual(versionRequest.formatVersion('2.2'), '2.2.0');
  });

  it('doesnt change the version, if its correctly formatted', () => {
    assert.strictEqual(versionRequest.formatVersion('2.2.0'), '2.2.0');
  });

  it('converts and corrects the version, if the input is a number', () => {
    assert.strictEqual(versionRequest.formatVersion(1), '1.0.0');
    assert.strictEqual(versionRequest.formatVersion(1.2), '1.2.0');
  });

  it('should truncate the version if its longer than it should be', () => {
    assert.strictEqual(versionRequest.formatVersion('1.0.0.0.0.0.1'), '1.0.0');
    assert.strictEqual(versionRequest.formatVersion('1.0.1.1.0.0.1'), '1.0.1');
  });

  it('returns undefined, if the input cant be converted into a correct version', () => {
    assert.strictEqual(versionRequest.formatVersion(undefined), undefined);
    assert.strictEqual(versionRequest.formatVersion(null), undefined);
    assert.strictEqual(versionRequest.formatVersion(''), undefined);
    assert.strictEqual(versionRequest.formatVersion(0), undefined);
    assert.strictEqual(versionRequest.formatVersion(() => {}), undefined);
  });
});
