import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import versionRequest from '../index.js'

describe('setVersionByAcceptHeader', () => {
  const context = {};

  beforeEach(() => {
    context.req = {
      headers: {}
    };
  });

  it('we can set the version using the Accept header version field', () => {
    const versionNumber = '1.0.0';

    context.req.headers['accept'] = `application/vnd.company+json;version=${versionNumber}`;
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can set the version using the Accept header version field, even if we have multiple parameters', () => {
    const versionNumber = '1.0.0';

    context.req.headers['accept'] = `application/vnd.company+json;param1=1,version=${versionNumber}, param3=3`;
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can set the version using the Accept header version field, even if it has funky whitespaces', () => {
    const versionNumber = '1.0.0';

    context.req.headers['accept'] = `application/vnd.company+json; param1=1,      version =${versionNumber}  , param3=3`;
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can set the version using the Accept header version field, even if it mixes lower- and uppercase characters', () => {
    const versionNumber = '1.0.0';

    context.req.headers['accept'] = `application/vnd.company+json; param1=1,      Version =${versionNumber}  , param3=3`;
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('dont set the version if the Accept header has no "version" parameter', () => {
    context.req.headers['accept'] = 'application/vnd.company+json;param1=1, param2=2';
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('dont set the version if the Accept header has no parameters at all', () => {
    context.req.headers['accept'] = 'application/vnd.company+json;';
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('dont set the version if the Accept header has no parameters at all (without ending ;)', () => {
    context.req.headers['accept'] = 'application/vnd.company+json';
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('dont set the version if the Accept header if we cant parse it', () => {
    context.req.headers['accept'] = 'application/json;abd';
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('dont set the version if the Accept header if we cant parse it', () => {
    context.req.headers['accept'] = 42;
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  //  Alternative format
  it('we can set the version using the Accept header alternative format 1', () => {
    const versionNumber = '1.0.0';

    context.req.headers['accept'] = `application/vnd.company-v${versionNumber}+json`;
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can set the version using the Accept header alternative format 2', () => {
    const versionNumber = '1.0.0';

    context.req.headers['accept'] = `application/vnd.company.v${versionNumber}+json`;
    const middleware = versionRequest.setVersionByAcceptHeader();

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can set the version using the Accept header alternative format, even if it has whitespaces', () => {
    const versionNumber = '1.0.0';

    const headers = { accept: `application/ vnd.company -v${versionNumber} + json` };
    const resultingVersion = versionRequest.setVersionByAcceptFormat(headers);

    assert.strictEqual(resultingVersion, versionNumber);
  });

  it('dont set the version, if the alternative format is incorrect', () => {
    const headers = { accept: 'application/ vnd.company -v1.0.0///json' };
    const resultingVersion = versionRequest.setVersionByAcceptFormat(headers);

    assert.strictEqual(resultingVersion, undefined);
  });

  //  Custom function
  it('we can set the version using a custom function to parse the Accept header', () => {
    const versionNumber = '1.0.0';

    context.req.headers['accept'] = versionNumber;
    const middleware = versionRequest.setVersionByAcceptHeader(v => v);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });
  });

  it('we can handle, if the custom function returns a number', t => {
    const versionNumber = '1.1';
    const versionRequestSpy = t.mock.method(versionRequest, 'formatVersion');

    context.req.headers['accept'] = versionNumber;
    const middleware = versionRequest.setVersionByAcceptHeader(v => parseFloat(v));

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, `${versionNumber}.0`);
      assert.strictEqual(versionRequestSpy.mock.callCount(), 1);
    });
  });

  it('we can handle, if the custom function returns a boolean', () => {
    const versionNumber = true;

    context.req.headers['accept'] = versionNumber;
    const middleware = versionRequest.setVersionByAcceptHeader(() => versionNumber);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, undefined);
    });
  });

  it('we can handle, if the custom function returns an object', () => {
    const versionNumber = {alpha: true};
    context.req.headers['accept'] = 1;
    const middleware = versionRequest.setVersionByAcceptHeader(() => { return versionNumber });

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, JSON.stringify(versionNumber));
    });
  });
});
