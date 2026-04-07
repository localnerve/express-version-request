import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js'

describe('formatVersion', () => {
  describe('normalizeSemver', () => {
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
  });

  it('returns custom string if given a custom string', () => {
    assert.strictEqual(versionRequest.formatVersion('alpha'), 'alpha');
  });

  it('returns a CustomVersion object if given an object, part 1', () => {
    assert.deepStrictEqual(versionRequest.formatVersion({}), {
      label: 'custom',
      meta: {},
      original: '[object Object]',
      isCustom: true
    });
  });

  it('returns a CustomVersion object if given an object, part 2', () => {
    assert.deepStrictEqual(versionRequest.formatVersion({
      label: 'alpha'
    }), {
      label: 'alpha',
      meta: {},
      original: '[object Object]',
      isCustom: true
    });
  });

  it('returns a CustomVersion object if given an object, part 3', () => {
    assert.deepStrictEqual(versionRequest.formatVersion({
      version: 'alpha'
    }), {
      label: 'alpha',
      meta: {},
      original: '[object Object]',
      isCustom: true
    });
  });

  it('returns a CustomVersion object if given an object, part 4', () => {
    const meta = {
      prop: 'val'
    };
    assert.deepStrictEqual(versionRequest.formatVersion({
      version: 'alpha',
      meta
    }), {
      label: 'alpha',
      meta,
      original: '[object Object]',
      isCustom: true
    });
  });

  it('returns a CustomVersion object if given an object, part 5', () => {
    const meta = Object.create(null);
    meta.prop = 'val';

    assert.deepStrictEqual(versionRequest.formatVersion({
      version: 'alpha',
      meta
    }), {
      label: 'alpha',
      meta: {
        prop: 'val'
      },
      original: '[object Object]',
      isCustom: true
    });
  });

  it('returns a CustomVersion object if given an object, part 6', () => {
    const meta = Object.create(null);
    const customString = 'customString';
    meta.prop = 'val';

    assert.deepStrictEqual(versionRequest.formatVersion({
      version: 'alpha',
      meta,
      toString: () => customString
    }), {
      label: 'alpha',
      meta: {
        prop: 'val'
      },
      original: customString,
      isCustom: true
    });
  });

  it('returns a CustomVersion object if given an object, part 7', () => {
    const meta = {
      prop: 'val'
    };

    assert.deepStrictEqual(versionRequest.formatVersion({
      version: 'alpha',
      meta,
      toString: undefined
    }), {
      label: 'alpha',
      meta,
      original: 'object',
      isCustom: true
    });
  });

  it('returns a CustomVersion object if given an object, part 8', () => {
    assert.deepStrictEqual(versionRequest.formatVersion({
      version: 'alpha',
      meta: Symbol('test')
    }), {
      label: 'alpha',
      meta: {},
      original: '[object Object]',
      isCustom: true
    });
  });

  it('returns undefined, if the input cant be converted into a correct version', () => {
    assert.strictEqual(versionRequest.formatVersion(undefined), undefined);
    assert.strictEqual(versionRequest.formatVersion(null), undefined);
    assert.strictEqual(versionRequest.formatVersion(''), undefined);
    assert.strictEqual(versionRequest.formatVersion(0), undefined);
    assert.strictEqual(versionRequest.formatVersion(() => {}), undefined);
    assert.strictEqual(versionRequest.formatVersion([]), undefined);
    assert.strictEqual(versionRequest.formatVersion(true), undefined);
    assert.strictEqual(versionRequest.formatVersion(false), undefined);
  });
});
