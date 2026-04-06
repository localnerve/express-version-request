import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js'

describe('setVersion', () => {
  const context = { req: {} };

  beforeEach(() => {
    context.req = {};
  });

  it('we can manually set a specific version to be integer', t => {
    const versionNumber = 1;
    const versionRequestSpy = t.mock.method(versionRequest, 'formatVersion');

    const middleware = versionRequest.setVersion(versionNumber);
    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, `${versionNumber}.0.0`);
      assert.strictEqual(versionRequestSpy.mock.callCount(), 1);
    });
  });

  it('we can manually set a specific version to be string', () => {
    const versionNumber = '1.0.0';

    const middleware = versionRequest.setVersion(versionNumber);
    middleware(context.req, {}, () => {
      assert.strictEqual(versionNumber, context.req.version);
    });
  });

  it('we can manually set a specific version to be object', () => {
    const versionNumber = { myVersion: 'alpha' };

    const middleware = versionRequest.setVersion(versionNumber);
    middleware(context.req, {}, () => {
      assert.strictEqual(JSON.stringify(versionNumber), context.req.version);
    });
  });
});
