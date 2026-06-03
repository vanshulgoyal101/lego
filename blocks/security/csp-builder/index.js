export class CSPBuilder {
  constructor(initialDirectives = {}) {
    this.directives = new Map();
    for (const [key, value] of Object.entries(initialDirectives)) {
      this.directives.set(key, Array.isArray(value) ? [...value] : [value]);
    }
  }

  directive(name, ...sources) {
    if (!name || typeof name !== 'string') {
      throw new Error('Directive name must be a non-empty string');
    }
    const normalizedName = name.trim().toLowerCase();
    const cleanedSources = sources
      .flat()
      .filter((s) => typeof s === 'string' && s.length > 0)
      .map((s) => s.trim());

    if (!this.directives.has(normalizedName)) {
      this.directives.set(normalizedName, []);
    }
    this.directives.get(normalizedName).push(...cleanedSources);
    return this;
  }

  defaultSrc(...sources) { return this.directive('default-src', ...sources); }
  scriptSrc(...sources) { return this.directive('script-src', ...sources); }
  styleSrc(...sources) { return this.directive('style-src', ...sources); }
  imgSrc(...sources) { return this.directive('img-src', ...sources); }
  connectSrc(...sources) { return this.directive('connect-src', ...sources); }
  fontSrc(...sources) { return this.directive('font-src', ...sources); }
  objectSrc(...sources) { return this.directive('object-src', ...sources); }
  mediaSrc(...sources) { return this.directive('media-src', ...sources); }
  frameSrc(...sources) { return this.directive('frame-src', ...sources); }
  childSrc(...sources) { return this.directive('child-src', ...sources); }
  formAction(...sources) { return this.directive('form-action', ...sources); }
  frameAncestors(...sources) { return this.directive('frame-ancestors', ...sources); }
  reportUri(uri) { return this.directive('report-uri', uri); }
  reportTo(group) { return this.directive('report-to', group); }

  addNonce(directiveName, nonce) {
    return this.directive(directiveName, `'nonce-${nonce}'`);
  }

  addHash(directiveName, algorithm, hashBase64) {
    return this.directive(directiveName, `'${algorithm}-${hashBase64}'`);
  }

  removeDirective(name) {
    if (!name) return false;
    return this.directives.delete(name.trim().toLowerCase());
  }

  build() {
    const parts = [];
    for (const [name, sources] of this.directives.entries()) {
      const uniqueSources = [...new Set(sources)];
      if (uniqueSources.length > 0) {
        parts.push(`${name} ${uniqueSources.join(' ')}`);
      } else {
        parts.push(name);
      }
    }
    return parts.join('; ');
  }

  static validate(cspString) {
    const warnings = [];
    if (!cspString || typeof cspString !== 'string') {
      return { valid: false, errors: ['CSP must be a non-empty string'], warnings: [] };
    }

    const directives = new Map();
    const parts = cspString.split(';').map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      const tokens = part.split(/\s+/);
      const name = tokens[0].toLowerCase();
      const sources = tokens.slice(1);
      directives.set(name, sources);
    }

    // 1. Missing default-src
    if (!directives.has('default-src')) {
      warnings.push("Missing 'default-src' directive. It is recommended as a fallback.");
    }

    const getEffectiveDirective = (name) => {
      if (directives.has(name)) return directives.get(name);
      return directives.get('default-src') || [];
    };

    // 2. Unsafe script-src
    const scriptSources = getEffectiveDirective('script-src');
    if (scriptSources.length === 0 && !directives.has('default-src')) {
      warnings.push("No fallback or explicit 'script-src' defined, which may block script execution.");
    } else {
      if (scriptSources.includes('*')) {
        warnings.push("'script-src' allows wildcard '*', which permits loading scripts from any origin.");
      }
      if (scriptSources.includes('data:')) {
        warnings.push("'script-src' allows 'data:', which is vulnerable to XSS via data URLs.");
      }
      if (
        scriptSources.includes("'unsafe-inline'") &&
        !scriptSources.some(
          (s) =>
            s.startsWith("'nonce-") ||
            s.startsWith("'sha256-") ||
            s.startsWith("'sha384-") ||
            s.startsWith("'sha512-") ||
            s === "'strict-dynamic'"
        )
      ) {
        warnings.push("'script-src' allows 'unsafe-inline' without nonces or hashes, permitting inline script execution.");
      }
    }

    // 3. Unsafe object-src
    const objectSources = getEffectiveDirective('object-src');
    if (!directives.has('object-src') && !directives.has('default-src')) {
      warnings.push("Missing 'object-src' directive, which defaults to '*' and allows execution of unsafe plugins.");
    } else if (
      objectSources.includes('*') ||
      objectSources.includes('http:') ||
      objectSources.includes('https:')
    ) {
      warnings.push("'object-src' allows wildcards or broad protocols, allowing unsafe plugins.");
    } else if (directives.has('object-src') && objectSources.length === 0) {
      warnings.push("'object-src' is defined but empty.");
    } else if (directives.has('object-src') && !objectSources.includes("'none'") && objectSources.length > 0) {
      warnings.push("'object-src' should preferably be set to 'none' to block plugin execution.");
    }

    // 4. Wildcard in frame-ancestors
    if (directives.has('frame-ancestors')) {
      const ancestors = directives.get('frame-ancestors');
      if (ancestors.includes('*')) {
        warnings.push("'frame-ancestors' allows wildcard '*', leaving the site vulnerable to clickjacking.");
      }
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  validate() {
    return CSPBuilder.validate(this.build());
  }
}
