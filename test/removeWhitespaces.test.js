import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js';

describe('removeWhitespaces', () => {
  it('removes whitespaces from a string', () => {
    assert.strictEqual(versionRequest.removeWhitespaces('a  '), 'a');
  });

  it('returns the same string if nothing to remove', () => {
    assert.strictEqual(versionRequest.removeWhitespaces('a'), 'a');
  });

  it('returns empty string if given object', () => {
    assert.strictEqual(versionRequest.removeWhitespaces({}), '');
  });

  it('returns empty string if given number', () => {
    assert.strictEqual(versionRequest.removeWhitespaces(42), '');
  });

  it('returns empty string if given array', () => {
    assert.strictEqual(versionRequest.removeWhitespaces(['a', 'b']), '');
  });
});
