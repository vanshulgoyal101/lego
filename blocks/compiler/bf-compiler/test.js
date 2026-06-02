import { describe, it, expect } from '../../../test/test-harness.js';
import { Brainfuck } from './index.js';

await describe('compiler/bf-compiler', async () => {
  await it('should execute Hello World program successfully in VM', () => {
    // Hello World program in Brainfuck
    const helloWorld = '++++++++[>++++[>++>+++>+++>+<<<<-] Great >+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.';
    const output = Brainfuck.run(helloWorld);
    expect(output).toBe('Hello World!\n');
  });

  await it('should support transpiling to JavaScript and running output function', () => {
    // Program to read two inputs and output them in reverse order
    const reverse = ',>,.<.';
    const jsCode = Brainfuck.compileToJS(reverse);
    const exec = new Function('input', jsCode);

    expect(exec('AB')).toBe('BA');
  });
});
