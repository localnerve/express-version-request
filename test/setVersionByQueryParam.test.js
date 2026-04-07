import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js'

describe('setVersionByQueryParam', () => {
  const context = {};

  beforeEach(() => {
    context.req = {
      query: {}
    };
  });

  it('dont set a version if req object is not well composed: req is null', () => {
    context.req = null;
    const middleware = versionRequest.setVersionByQueryParam();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req, null);
      assert.throws(function () {
        return context.req.version;
      });
    });
  });

  it('dont set a version if req object is not well composed: req is undefined', () => {
    context.req = undefined;
    const middleware = versionRequest.setVersionByQueryParam();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req, undefined);
      assert.throws(function () {
        return context.req.version;
      });
    });
  });

  it('dont set a version if req object is not well composed: req.query is undefined', () => {
    context.req.query = undefined;
    const middleware = versionRequest.setVersionByQueryParam();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.query, undefined);
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('dont set a version if no version query is set', () => {
    context.req.query = {};
    const middleware = versionRequest.setVersionByQueryParam();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('we can set a version on the request object by request query parameters', () => {
    const versionNumber = '1.0.0';

    context.req.query['api-version'] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can manually set a specific version to be string', () => {
    const versionNumber = '1.0.0';

    context.req.query['api-version'] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can manually set a specific version to be object', () => {
    const versionNumber = { version: 'alpha' };

    context.req.query['api-version'] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version.label, versionNumber.version);
    });
  });

  it('we can set a version on the request object by specifying custom http query param as integer', t => {
    const versionNumber = 1;
    const versionParamName = 'my-api-version-param';
    const versionRequestSpy = t.mock.method(versionRequest, 'formatVersion');

    context.req.query[versionParamName] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam(versionParamName);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, `${versionNumber}.0.0`);
      assert.strictEqual(versionRequestSpy.mock.callCount(), 1);
    });
  });

  it('we can set a version on the request object by specifying custom http query param as string', () => {
    const versionNumber = '1.0.0';
    const versionParamName = 'my-api-version-param';

    context.req.query[versionParamName] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam(versionParamName);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can set a version on the request object by specifying custom http query param by object', () => {
    const versionNumber = { version: 'alpha' };
    const versionParamName = 'my-api-version-param';

    context.req.query[versionParamName] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam(versionParamName);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version.label, versionNumber.version);
    });
  });

  it('custom query param should be deleted from req.query after handling it', () => {
    const versionNumber = '1.0.0';
    const versionParamName = 'my-api-version-param';
    const options = { removeQueryParam: true };

    context.req.query[versionParamName] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam(versionParamName, options);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
      assert.ok(!Object.hasOwn(context.req.query, versionParamName));
    });
  });

  it('default query param should be deleted from req.query after handling it', () => {
    const versionNumber = '1.0.0';
    const options = { removeQueryParam: true };

    context.req.query['api-version'] = versionNumber;
    const middleware = versionRequest.setVersionByQueryParam(null, options);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
      assert.ok(!Object.hasOwn(context.req.query, 'api-version'));
    });
  });
});