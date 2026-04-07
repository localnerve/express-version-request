# express-version-request

> Maintained, modernized fork of lirantal/express-version-request

## What is this?

This npm package provides an ExpressJS middleware that sets the request object with a `version` property by parsing a request HTTP header.  

## Why the fork?

  * Security fixes
  * RFC 9110 accept header support (with quality and order)
  * Dramatically reduced developer supply chain and attack surface

## Usage

### Set request version statically

If you wish to employ your own logic in some middleware/configuration and set the request version programmaticaly and not by parsing a specific HTTP header:

```js
import versionRequest from 'express-version-request';

app.use(versionRequest.setVersion('1.2.3'));
```

Then in later middlewares you will be able to access `req.version` property and it's value set to 1.2.3.

### Set request version by HTTP header

By default, the library will parse the version out of the `X-Api-Version` HTTP header:

```js
import versionRequest from 'express-version-request';

app.use(versionRequest.setVersionByHeader());
```

### Set request version by custom HTTP header

If you wish to advise the library which HTTP header to parse to extract the version:

```js
import versionRequest from 'express-version-request';

app.use(versionRequest.setVersionByHeader('My-HTTP-Header-Name'));
```

### Set request version by HTTP query parameter

By default, the library will parse the version out of the `api-version` query parameter:

```js
import versionRequest from 'express-version-request';

app.use(versionRequest.setVersionByQueryParam());
```

### Set request version by custom HTTP query parameter

If you wish to advise the library which query parameter to parse to extract the version:

```js
import versionRequest from 'express-version-request';

app.use(versionRequest.setVersionByQueryParam('myQueryParam'));
```
#### setVersionByQueryParam options 
The second parameter of `setVersionByQueryParam` is an options object.

### Set request version by 'Accept' header

By default, the library will parse the version from the Accept header, expecting the following format:
**Accept: application/vnd.company+json;version=1.0.0**
For more details about the Accept header format, please refer to the [RFC](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html).


```js
import versionRequest from 'express-version-request';

app.use(versionRequest.setVersionByAcceptHeader());
```
#### Parsing using an alternative format
As a fallback, the lib supports an alternative Accept header format:

**Accept: application/vnd.comapny-v1.0.0+json**

or

**Accept: application/vnd.comapny.v1.0.0+json**

The lib will try to parse the header using the default format, and if it doesn't succeed, tries this alternative format.
The usage is the same as in the case of the regular format:

```js
import versionRequest from 'express-version-request';

app.use(versionRequest.setVersionByAcceptHeader());
```
#### Parsing using a custom function
If you wish to use your own parsing, it is possible to pass a function as the first parameter.
The lib will then call it with the actual value of the Accept header as the first parameter, and the returned value will be set as version.
The provided function should return a **string**.

```js
import versionRequest from 'express-version-request';
function customParsingFunction(header) {
	// function body, that parses the header parameter and returns a string
}

app.use(versionRequest.setVersionByAcceptHeader(customParsingFunction));
```
#### Version formatting
Before setting the version, it is always formatted, so the resulting version is a semver comaptible string, except the following cases:

* if the version was set as an Object, it will be returned in stringified format (using JSON.stringify)
* if the version is longer than the semver format, we truncate it by cutting off the tail, and leaving the first three segments (e.g.: 1.2.3.4.5 will become 1.2.3)
* if we encounter something, that can't be parsed or formatted as a version, undefined is returned

This formatting function is called automatically for each version setting method, but it can also be used independently:
```js
import versionRequest from 'express-version-request';
const formattedVersion = versionRequest.formatVersion(versionThatNeedsFormatting);
```
##### Options

`removeQueryParam`

Delete version HTTP query parameter after setting the request object with a `version` property.
By default it is set to false.

```js
import versionRequest from 'express-version-request';
const options = { removeQueryParam: true };

app.use(versionRequest.setVersionByQueryParam('myQueryParam', options));
```

If you define a middleware after versionRequest then you can verify that the version is indeed set:

```js
app.use((req, res, next) => {
  console.log(req.version);
  next();
});
```

## TypeScript Support

Exports `index.d.ts` types for the CustomVersion type triggered by setting a version from an object.

_Note: Don't forget to add types for Express!_

## Tests and Coverage

```bash
npm test
```

Project linting:

```bash
npm run lint
```

## Author

Liran Tal <liran.tal@gmail.com>

## Maintainer

Alex Grant <alex@localnerve.com>
