export default class VersionRequest {
  /**
   * Returns Express middleware to set the Request.version from the given version string.
   * 
   * @param {String} version - The version string, 'N' or acceptable dot version variant
   * @returns {Function} Express middleware function to set Request.version 
   */
  static setVersion (version) {
    return (req, res, next) => {
      req.version = this.formatVersion(version);
      next();
    }
  }

  /**
   * Returns Express middleware to set the Request.version from a header by name.
   * Defaults to 'x-api-version' if not supplied.
   * 
   * @param {String} [hName] - The header name to set the version from, defaults to 'x-api-version'
   * @returns {Function} Express middleware function to set Request.version
   */
  static setVersionByHeader (hName = '') {
    const headerName = (hName && hName.toLowerCase()) || 'x-api-version';
    return (req, res, next) => {
      if (req && req.headers) {
        const version = req.headers[headerName];
        req.version = this.formatVersion(version);
      }

      next();
    }
  }

  /**
   * Returns Express middleware to set the Request.version from a query parameter.
   * 
   * @param {String} [queryParam] - The name of the query parameter, otherwise 'api-version'
   * @param {Object} [options] - options
   * @param {Boolean} [options.removeQueryParam] - True to eat the query parameter, defaults to false
   * @returns {Function} Express middleware function to set Request.version
   */
  static setVersionByQueryParam (queryParam, {
    removeQueryParam = false
  } = {}) {
    return (req, res, next) => {
      if (req && req.query) {
        const version = (queryParam && req.query[queryParam.toLowerCase()]) || req.query['api-version'];
        if (version !== undefined) {
          req.version = this.formatVersion(version);
          if (removeQueryParam === true) {
            if (queryParam && req.query[queryParam.toLowerCase()]) {
              delete req.query[queryParam.toLowerCase()];
            } else {
              delete req.query['api-version'];
            }
          }
        }
      }
      next();
    }
  }

  /**
   * Returns Express middleware to set the Request.version from an accept header.
   * Sets Request.version using standard rules or a custom function if supplied.
   * 
   * @param {Function} [customFunction] - Custom accept header processing function
   * @returns {Function} Express middleware function to set Request.version
   */
  static setVersionByAcceptHeader (customFunction = null) {
    return (req, res, next) => {
      if (req && req.headers && req.headers.accept) {
        if (customFunction && typeof customFunction === 'function') {
          req.version = this.formatVersion(customFunction(req.headers.accept));
        } else {
          const acceptHeader = String(req.headers.accept);
          const params = acceptHeader.split(';')[1];
          const paramMap = {};
          if (params) {
            for (const i of params.split(',')) {
              const keyValue = i.split('=');
              if (typeof keyValue === 'object' && keyValue[0] && keyValue[1]) {
                paramMap[this.removeWhitespaces(keyValue[0]).toLowerCase()] = this.removeWhitespaces(keyValue[1]);
              }
            }
            req.version = this.formatVersion(paramMap.version);
          }

          if (req.version === undefined) {
            req.version = this.formatVersion(this.extractVersionFromAcceptHeader(req.headers));
          }
        }
      }

      next();
    }
  }

  /**
   * HTTP specification (RFC 9110) compliant accept header version extraction.
   * Handles multiple versions, quality specifiers, and typical noise.
   * Sort by quality first (highest q wins, default q=1.0), fallback to order (first wins).
   *
   * @param {Object} headers - A headers object of name value pairs
   * @returns {String} The version found or undefined if none
   */
  static extractVersionFromAcceptHeader(headers) {
    const acceptHeader = String(headers?.accept || '');
    if (!acceptHeader) return undefined;

    // Parse and weight each media type
    const candidates = acceptHeader.split(',').map((entry, index) => {
      // Trim the entry first to remove errant whitespace at the start/end
      const cleanEntry = entry.trim();
      // Regex captures the version number in group 1
      const vMatch = cleanEntry.match(/[.-]v(\d+(?:\.\d+)*)(?=\s*[+;$]|$)/i);
      // Regex captures the quality value (q) in group 1
      const qMatch = cleanEntry.match(/;q=([0-9.]+)/i);

      return {
        version: vMatch ? vMatch[1] : null,
        quality: qMatch ? parseFloat(qMatch[1]) : 1.0,
        index
      };
    });

    // Filter out entries that didn't have a version match
    const versions = candidates.filter(c => c.version !== null);
    if (versions.length === 0) return undefined;

    // Sort by quality (descending), then by original position (ascending)
    versions.sort((a, b) => {
      if (b.quality !== a.quality) return b.quality - a.quality;
      return a.index - b.index;
    });

    // Return the highest priority version string
    return versions[0].version;
  }

  /**
   * Standalone function to strip global whitespace.
   * 
   * @param {String} str - The input string
   * @returns {String} A copy of the string with no whitespace
   */
  static removeWhitespaces (str) {
    if (typeof str === 'string') {
      return str.replace(/\s/g, '');
    }

    return '';
  }

  /**
   * Test if a string is appropriate for normalizeSemver.
   * 
   * @param {String|Number} version - The version string to test
   * @returns {Boolean} true if numeric semver, false otherwise
   */
  static isNumericSemver(version) {
    if (typeof version !== 'string' && typeof version !== 'number') {
      return false;
    }

    // Ensure it's only digits and dots from start to finish
    const str = version.toString().trim();
    const pattern = /^\d+(\.\d+)*$/;

    return pattern.test(str);
  }

  /**
   * Normalize a version number or string to a three dot semver version string.
   * 
   * @param {String|Number} version - A version number or string to normalize
   * @returns {String} A three dot semver version string
   */
  static normalizeSemver (version) {
    // This is redundant if used after isNumericSemver
    if (typeof version !== 'string' && typeof version !== 'number') {
      return undefined;
    }

    const parts = version.toString().trim().split('.');

    const numericParts = parts
      .map(p => p.replace(/\D/g, '')) // Remove non-digits
      .filter(p => p !== '');         // Remove empty segments

    if (numericParts.length === 0) return undefined;

    const finalParts = [
      numericParts[0] || '0',
      numericParts[1] || '0',
      numericParts[2] || '0'
    ];

    return finalParts.join('.');
  }

  /**
   * Custom version formatting.
   *   Boolean, falsy, or function returns undefined.
   *   Objects return CustomVersion representation to avoid Remote Property Injection attack.
   *   String dot versions get expanded to N.N.N (0's where none specified).
   *   String dot version that are longer than 3 dot get truncd to three dot.
   *   Plain old custom strings just pass through trimmed up.
   *
   *   @param {any} version - some input that might be a version
   *   @returns {VersionResult | undefined}
   */
  static formatVersion (version) {
    if (Array.isArray(version) || !version || typeof version === 'function' || version === true) {
      return undefined;
    }

    if (typeof version === 'object') {
      // CustomVersion
      return {
        label: version.version || version.label || 'custom',
        original: version.toString ? version.toString() : 'object',
        meta: version.meta && typeof version.meta === 'object' ? { ...version.meta } : {},
        isCustom: true
      };
    }

    if (this.isNumericSemver(version)) {
      return this.normalizeSemver(version);
    }

    return version.toString().trim();
  }
}
