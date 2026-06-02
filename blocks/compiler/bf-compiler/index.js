/**
 * Brainfuck Compiler and Virtual Machine Interpreter
 */
export class Brainfuck {
  /**
   * Transpile Brainfuck code to executable JavaScript string
   *
   * @param {string} code - Brainfuck source code
   * @returns {string} Transpiled JavaScript source code
   */
  static compileToJS(code) {
    let js = `const mem = new Uint8Array(30000); let ptr = 0; let out = ''; let inPtr = 0; `;
    js += `const inputStr = typeof input === 'string' ? input : ''; `;

    for (let i = 0; i < code.length; i++) {
      switch (code[i]) {
        case '>':
          js += 'ptr = (ptr + 1) % 30000; ';
          break;
        case '<':
          js += 'ptr = (ptr - 1 + 30000) % 30000; ';
          break;
        case '+':
          js += 'mem[ptr]++; ';
          break;
        case '-':
          js += 'mem[ptr]--; ';
          break;
        case '.':
          js += 'out += String.fromCharCode(mem[ptr]); ';
          break;
        case ',':
          js += 'mem[ptr] = inPtr < inputStr.length ? inputStr.charCodeAt(inPtr++) : 0; ';
          break;
        case '[':
          js += 'while(mem[ptr] !== 0) { ';
          break;
        case ']':
          js += '} ';
          break;
      }
    }
    js += 'return out;';
    return js;
  }

  /**
   * Interpret and execute Brainfuck code in a Virtual Machine environment
   *
   * @param {string} code - Brainfuck code
   * @param {string} [input=''] - Inputs stream
   * @returns {string} Standard output returned by the program
   */
  static run(code, input = '') {
    const memory = new Uint8Array(30000);
    let ptr = 0;
    let inputPtr = 0;
    let output = '';

    // Precompute jump targets to achieve O(1) loop traversal
    const jumpMap = {};
    const stack = [];
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '[') {
        stack.push(i);
      } else if (code[i] === ']') {
        if (stack.length === 0) {
          throw new Error(`SyntaxError: Unmatched ']' at index ${i}`);
        }
        const start = stack.pop();
        jumpMap[start] = i;
        jumpMap[i] = start;
      }
    }

    if (stack.length > 0) {
      throw new Error(`SyntaxError: Unmatched '[' at index ${stack.pop()}`);
    }

    let pc = 0;
    const n = code.length;
    while (pc < n) {
      const cmd = code[pc];
      switch (cmd) {
        case '>':
          ptr = (ptr + 1) % 30000;
          break;
        case '<':
          ptr = (ptr - 1 + 30000) % 30000;
          break;
        case '+':
          memory[ptr]++;
          break;
        case '-':
          memory[ptr]--;
          break;
        case '.':
          output += String.fromCharCode(memory[ptr]);
          break;
        case ',':
          if (inputPtr < input.length) {
            memory[ptr] = input.charCodeAt(inputPtr++);
          } else {
            memory[ptr] = 0;
          }
          break;
        case '[':
          if (memory[ptr] === 0) {
            pc = jumpMap[pc];
          }
          break;
        case ']':
          if (memory[ptr] !== 0) {
            pc = jumpMap[pc];
          }
          break;
      }
      pc++;
    }

    return output;
  }
}
export default Brainfuck;
