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
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    assert.strictEqual(resultingVersion, versionNumber);
  });

  it('dont set the version, if the alternative format is incorrect', () => {
    const headers = { accept: 'application/ vnd.company -v1.0.0///json' };
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    assert.strictEqual(resultingVersion, undefined);
  });

  it('extracts version when followed by spaces and a plus sign', () => {
    const versionNumber = '1.0.0';
    // Test for: ...v1.0.0 +json
    const headers = { accept: `application/vnd.company.v${versionNumber} +json` };
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    assert.strictEqual(resultingVersion, versionNumber);
  });

  it('extracts version when followed by semicolon parameters and quality values', () => {
    const versionNumber = '1';
    // Test for: ...v1 ;q=0.8; level =1
    const headers = { accept: `application/vnd.company-v${versionNumber} ;q=0.8; level =1` };
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    assert.strictEqual(resultingVersion, versionNumber);
  });

  it('extracts version at the very end of the string with trailing whitespace', () => {
    const versionNumber = '2.4.1';
    const headers = { accept: `application/vnd.company.v${versionNumber}   ` };
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    assert.strictEqual(resultingVersion, versionNumber);
  });

  it('returns undefined if version is followed by invalid delimiters', () => {
    // Test for: ...v1.0.0/json (using / instead of + or ;)
    const headers = { accept: 'application/vnd.company-v1.0.0/json' };
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    assert.strictEqual(resultingVersion, undefined);
  });

  it('prioritizes higher q-value even if it appears later in the string', () => {
    // v1.0 has no q (defaults to 1.0), v2.0 has q=0.8, v3.0 has q=0.9
    const headers = { 
      accept: 'application/vnd-v2.0+json;q=0.8, application/vnd-v3.0+json;q=0.9, application/vnd-v1.0+json' 
    };
    
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    // Should return '1.0' because its implicit q=1.0 is highest
    assert.strictEqual(resultingVersion, '1.0');
  });

  it('prioritizes version by order with default q=1.0 when no q present', () => {
    const version = '2.0';
    const headers = {
      //                                                 intentional bs vvv
      accept: `application/vnd-v${version}+json, application/vnd-v3.0+json;, application/vnd-v1.0+json`
    };
    
    const resultingVersion = versionRequest.extractVersionFromAcceptHeader(headers);

    // Should return '2.0' because it's first and they're all q=1.0 by default
    assert.strictEqual(resultingVersion, version);
  });

  //  Custom function
  it('we can set the version using a custom function to parse the Accept header', t => {
    const versionNumber = '1.0.0';
    const customFunction = t.mock.fn(v => v);

    context.req.headers['accept'] = versionNumber;
    const middleware = versionRequest.setVersionByAcceptHeader(customFunction);

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version, versionNumber);
    });

    assert.strictEqual(customFunction.mock.callCount(), 1);
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
    const versionNumber = { version: 'alpha' };
    context.req.headers['accept'] = 1;
    const middleware = versionRequest.setVersionByAcceptHeader(() => { return versionNumber });

    middleware(context.req, {}, () => {
      assert.strictEqual(context.req.version.label, versionNumber.version);
    });
  });
});
