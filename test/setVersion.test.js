import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js'

describe('setVersion', () => {
  const context = { req: {} };

  beforeEach(() => {
    context.req = {};
  });

  it('can manually set a specific version to be integer', t => {
    const versionNumber = 1;
    const versionRequestSpy = t.mock.method(versionRequest, 'formatVersion');

    const middleware = versionRequest.setVersion(versionNumber);
    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, `${versionNumber}.0.0`);
      assert.strictEqual(versionRequestSpy.mock.callCount(), 1);
    });
  });

  it('can manually set a specific version to be float', t => {
    const versionNumber = 1.1;
    const versionRequestSpy = t.mock.method(versionRequest, 'formatVersion');

    const middleware = versionRequest.setVersion(versionNumber);
    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, `${versionNumber}.0`);
      assert.strictEqual(versionRequestSpy.mock.callCount(), 1);
    });
  });

  it('can manually set a specific version to be string', () => {
    const versionNumber = '1.0.0';

    const middleware = versionRequest.setVersion(versionNumber);
    middleware(context.req, {}, () => {
      assert.strictEqual(versionNumber, context.req.version);
    });
  });

  it('can manually set a specific version to be object', () => {
    const versionNumber = { version: 'alpha' };

    const middleware = versionRequest.setVersion(versionNumber);
    middleware(context.req, {}, () => {
      assert.strictEqual(versionNumber.version, context.req.version.label);
    });
  });

  it('can handle an arbitrary version string', () => {
    const version = 'alpha';

    const middleware = versionRequest.setVersion(version);
    middleware(context.req, {}, () => {
      assert.strictEqual(version, context.req.version);
    });
  });

  it('can set an special object', () => {
    const version = {
      label: 'alpha',
      meta: {
        some: 'other',
        data: 42
      }
    };

    const middleware = versionRequest.setVersion(version);
    middleware(context.req, {}, () => {
      assert.strictEqual(version.label, context.req.version.label);
      assert.strictEqual(true, context.req.version.isCustom);
      assert.strictEqual('[object Object]', context.req.version.original);
      assert.deepStrictEqual(version.meta, context.req.version.meta);
    });
  });

  it('bad data type returns undefined', () => {
    const version = [];

    const middleware = versionRequest.setVersion(version);
    middleware(context.req, {}, () => {
      assert.strictEqual(undefined, context.req.version);
    });
  });

  it('Some bad data falls through as a string, part 1', () => {
    const version = BigInt(42);

    const middleware = versionRequest.setVersion(version);
    middleware(context.req, {}, () => {
      assert.strictEqual('42', context.req.version);
    });
  });

  it('Some bad data falls through as a string, part 2', () => {
    const version = Symbol('test');

    const middleware = versionRequest.setVersion(version);
    middleware(context.req, {}, () => {
      assert.strictEqual('Symbol(test)', context.req.version);
    });
  });
});
