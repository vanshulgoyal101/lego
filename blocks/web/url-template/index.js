/**
 * URI Template (RFC 6570) Parser
 */
export class UrlTemplate {
  constructor(template) {
    this.template = template;
  }

  /**
   * Expand the URL template with variable values
   *
   * @param {Object} variables - Key-value pair configuration
   * @returns {string} Fully expanded URL string
   */
  expand(variables) {
    return this.template.replace(/\{([+#./;?&]?)(.+?)\}/g, (match, operator, varList) => {
      const vars = varList.split(',');
      const results = [];

      let separator = ',';
      let prefix = '';
      let isQuery = false;
      let isPath = false;

      switch (operator) {
        case '+':
          separator = ',';
          break;
        case '#':
          prefix = '#';
          separator = ',';
          break;
        case '.':
          prefix = '.';
          separator = '.';
          break;
        case '/':
          prefix = '/';
          separator = '/';
          isPath = true;
          break;
        case ';':
          prefix = ';';
          separator = ';';
          break;
        case '?':
          prefix = '?';
          separator = '&';
          isQuery = true;
          break;
        case '&':
          prefix = '&';
          separator = '&';
          isQuery = true;
          break;
      }

      for (const v of vars) {
        // Handle modifier like explode (*) or prefix (:n) if any
        let varName = v;
        let explode = false;
        if (v.endsWith('*')) {
          explode = true;
          varName = v.slice(0, -1);
        }

        const value = variables[varName];
        if (value === undefined || value === null) continue;

        if (Array.isArray(value)) {
          if (explode) {
            const arrMapped = value.map(val => {
              const valEnc = encodeURIComponent(val);
              return isQuery ? `${varName}=${valEnc}` : valEnc;
            });
            results.push(arrMapped.join(separator));
          } else {
            const arrVal = value.map(encodeURIComponent).join(',');
            results.push(isQuery ? `${varName}=${arrVal}` : arrVal);
          }
        } else if (typeof value === 'object') {
          // Object representation
          const keys = Object.keys(value);
          if (explode) {
            const objMapped = keys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(value[k])}`);
            results.push(objMapped.join(separator));
          } else {
            const objVal = keys.map(k => `${encodeURIComponent(k)},${encodeURIComponent(value[k])}`).join(',');
            results.push(isQuery ? `${varName}=${objVal}` : objVal);
          }
        } else {
          // Primitive
          const valEnc = encodeURIComponent(value);
          if (isQuery) {
            results.push(`${varName}=${valEnc}`);
          } else if (operator === ';') {
            results.push(value === '' ? varName : `${varName}=${valEnc}`);
          } else {
            results.push(valEnc);
          }
        }
      }

      if (results.length === 0) return '';
      return prefix + results.join(separator);
    });
  }
}
