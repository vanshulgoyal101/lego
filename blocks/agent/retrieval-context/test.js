import { describe, it, expect } from '../../../test/test-harness.js';
import { chunkText, tokenize, tfidfScore, RetrievalContext } from './index.js';

describe('chunkText', () => {
  it('splits text into chunks of given size', () => {
    const chunks = chunkText('a'.repeat(1200), { chunkSize: 500, overlap: 0 });
    expect(chunks.length).toBe(3);
    expect(chunks[0].text.length).toBe(500);
    expect(chunks[2].text.length).toBe(200);
  });

  it('applies overlap correctly', () => {
    const chunks = chunkText('a'.repeat(100), { chunkSize: 60, overlap: 20 });
    // step = 40, so chunks start at 0, 40, 80
    expect(chunks.length).toBe(3);
    expect(chunks[1].start).toBe(40);
  });

  it('returns single chunk for short text', () => {
    const chunks = chunkText('hello world', { chunkSize: 500 });
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe('hello world');
  });

  it('returns empty array for empty string', () => {
    expect(chunkText('')).toEqual([]);
  });

  it('throws when chunkSize <= 0', () => {
    let threw = false;
    try { chunkText('text', { chunkSize: 0 }); } catch { threw = true; }
    expect(threw).toBe(true);
  });
});

describe('tokenize', () => {
  it('lowercases and splits on non-word chars', () => {
    const tokens = tokenize('Hello, World!');
    expect(tokens.includes('hello')).toBe(true);
    expect(tokens.includes('world')).toBe(true);
  });

  it('removes stop words', () => {
    const tokens = tokenize('the quick brown fox');
    expect(tokens.includes('the')).toBe(false);
    expect(tokens.includes('quick')).toBe(true);
  });

  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('tfidfScore', () => {
  it('returns 0 for empty query', () => {
    const corpus = [{ text: 'hello world' }];
    expect(tfidfScore('', corpus[0], corpus)).toBe(0);
  });

  it('returns higher score for more relevant chunk', () => {
    const corpus = [
      { text: 'javascript programming language' },
      { text: 'cooking recipes pasta' },
    ];
    const jsScore = tfidfScore('javascript programming', corpus[0], corpus);
    const cookScore = tfidfScore('javascript programming', corpus[1], corpus);
    expect(jsScore > cookScore).toBe(true);
  });
});

describe('RetrievalContext', () => {
  it('indexes documents and searches for relevant chunks', () => {
    const rc = new RetrievalContext({ topK: 2 });
    rc.index([
      'The capital of France is Paris. Paris is famous for the Eiffel Tower.',
      'Python is a popular programming language used for data science.',
    ]);
    const results = rc.search('France Paris capital');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score > 0).toBe(true);
  });

  it('buildContext returns a string', () => {
    const rc = new RetrievalContext({ topK: 2 });
    rc.index(['hello world', 'foo bar baz']);
    const ctx = rc.buildContext('hello');
    expect(typeof ctx).toBe('string');
  });

  it('returns empty string after clear', () => {
    const rc = new RetrievalContext();
    rc.index(['some content here']);
    rc.clear();
    const results = rc.search('content');
    expect(results.length).toBe(0);
  });

  it('accepts objects with id and text', () => {
    const rc = new RetrievalContext({ topK: 1 });
    rc.index([{ id: 'doc1', text: 'machine learning neural networks' }]);
    const results = rc.search('neural networks');
    expect(results.length).toBe(1);
  });
});
