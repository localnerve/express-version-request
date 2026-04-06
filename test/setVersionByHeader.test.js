import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js'

describe('setVersionByHeader', () => {
  const context = {};

  beforeEach(() => {
    context.req = {
      headers: {
        'x-timestamp': Date.now()
      }
    };
  });

  it('dont set a version if req object is not well composed: req is null', () => {
    context.req = null;
    const middleware = versionRequest.setVersionByHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req, null);
      assert.throws(function () {
        return context.req.version;
      });
    });
  });

  it('dont set a version if req object is not well composed: req is undefined', () => {
    context.req = undefined;
    const middleware = versionRequest.setVersionByHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req, undefined);
      assert.throws(function () {
        return context.req.version;
      });
    });
  });

  it('dont set a version if req object is not well composed: req.headers is undefined', () => {
    context.req.headers = undefined;
    const middleware = versionRequest.setVersionByHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.headers, undefined);
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('dont set a version if no version header is set', () => {
    context.req.headers = {};
    const middleware = versionRequest.setVersionByHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('we can set a version on the request object by request headers', () => {
    const versionNumber = '1.0.0';

    context.req.headers['x-api-version'] = versionNumber;
    const middleware = versionRequest.setVersionByHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can manually set a specific version to be string', () => {
    const versionNumber = '1.0.0';

    context.req.headers['x-api-version'] = versionNumber;
    const middleware = versionRequest.setVersionByHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can manually set a specific version to be object', () => {
    const versionNumber = { myVersion: 'alpha' };

    context.req.headers['x-api-version'] = versionNumber;
    const middleware = versionRequest.setVersionByHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, JSON.stringify(versionNumber));
    });
  });

  it('we can set a version on the request object by specifying custom http header as integer', t => {
    const versionNumber = 1;
    const versionHeaderName = 'my-api-version-header';
    const versionRequestSpy = t.mock.method(versionRequest, 'formatVersion');

    context.req.headers[versionHeaderName] = versionNumber;
    const middleware = versionRequest.setVersionByHeader(versionHeaderName);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, `${versionNumber}.0.0`);
      assert.strictEqual(versionRequestSpy.mock.callCount(), 1);
    });
  });

  it('we can set a version on the request object by specifying custom http header as string', () => {
    const versionNumber = '1.0.0';
    const versionHeaderName = 'my-api-version-header';

    context.req.headers[versionHeaderName] = versionNumber;
    const middleware = versionRequest.setVersionByHeader(versionHeaderName);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can set a version on the request object by specifying custom http header by object', () => {
    const versionNumber = { myVersion: 'alpha' };
    const versionHeaderName = 'my-api-version-header';

    context.req.headers[versionHeaderName] = versionNumber;
    const middleware = versionRequest.setVersionByHeader(versionHeaderName);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, JSON.stringify(versionNumber));
    });
  });
});