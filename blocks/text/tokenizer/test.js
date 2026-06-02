import { describe, it, expect } from '../../../test/test-harness.js';
import { tokenize, tokenizeWords, tokenizeSentences, ngrams } from './index.js';

await describe('text/tokenizer', async () => {
  await it('tokenize: should split on whitespace and punctuation', () => {
    const tokens = tokenize('Hello, world!');
    expect(tokens.includes('Hello')).toBe(true);
    expect(tokens.includes(',')).toBe(true);
    expect(tokens.includes('world')).toBe(true);
    expect(tokens.includes('!')).toBe(true);
  });

  await it('tokenize: lowercase option', () => {
    const tokens = tokenize('Hello World', { lowercase: true });
    expect(tokens.includes('hello')).toBe(true);
    expect(tokens.includes('world')).toBe(true);
  });

  await it('tokenize: removePunctuation option', () => {
    const tokens = tokenize('Hello, world!', { removePunctuation: true });
    expect(tokens.includes(',')).toBe(false);
    expect(tokens.includes('!')).toBe(false);
    expect(tokens.includes('Hello')).toBe(true);
  });

  await it('tokenize: stopWords option removes specified words', () => {
    const tokens = tokenize('the cat sat on the mat', {
      removePunctuation: true,
      stopWords: ['the', 'on']
    });
    expect(tokens.includes('the')).toBe(false);
    expect(tokens.includes('on')).toBe(false);
    expect(tokens.includes('cat')).toBe(true);
  });

  await it('tokenize: empty string returns empty array', () => {
    expect(tokenize('').length).toBe(0);
  });

  await it('tokenizeWords: should return only word tokens', () => {
    const words = tokenizeWords("It's a test.");
    expect(words.includes('test')).toBe(true);
    expect(words.includes('.')).toBe(false);
    expect(words.includes('a')).toBe(true);
  });

  await it('tokenizeWords: empty string returns empty array', () => {
    expect(tokenizeWords('').length).toBe(0);
  });

  await it('tokenizeSentences: should split at sentence boundaries', () => {
    const sents = tokenizeSentences('Hello world. How are you? Fine!');
    expect(sents.length).toBe(3);
    expect(sents[0]).toBe('Hello world.');
    expect(sents[1]).toBe('How are you?');
    expect(sents[2]).toBe('Fine!');
  });

  await it('tokenizeSentences: single sentence returns one element', () => {
    const sents = tokenizeSentences('Just one sentence.');
    expect(sents.length).toBe(1);
  });

  await it('ngrams: should produce bigrams', () => {
    const result = ngrams(['a', 'b', 'c', 'd'], 2);
    expect(result.length).toBe(3);
    expect(result[0]).toEqual(['a', 'b']);
    expect(result[2]).toEqual(['c', 'd']);
  });

  await it('ngrams: should produce trigrams', () => {
    const result = ngrams(['a', 'b', 'c', 'd'], 3);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual(['a', 'b', 'c']);
  });

  await it('ngrams: n larger than array returns empty', () => {
    expect(ngrams(['a', 'b'], 5).length).toBe(0);
  });

  await it('ngrams: throws on invalid n', () => {
    expect(() => ngrams(['a'], 0)).toThrow();
  });
});
