import { describe, it, expect } from '../../../test/test-harness.js';
import { CSVParser, CSVStringifier } from './index.js';

await describe('stream/csv-streamer', async () => {
  await it('should parse simple CSV with headers from chunks', async () => {
    const chunks = ['name,age\nAl', 'ice,30\nBob,25\n'];
    const parser = new CSVParser();
    
    const results = [];
    for await (const row of parser.parse(chunks)) {
      results.push(row);
    }

    expect(results).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' }
    ]);
  });

  await it('should handle custom delimiters and quoted values with commas', async () => {
    const chunks = ['id;description;price\n101;"Red pen, smooth";1.99\n'];
    const parser = new CSVParser({ delimiter: ';', headers: true });

    const results = [];
    for await (const row of parser.parse(chunks)) {
      results.push(row);
    }

    expect(results).toEqual([
      { id: '101', description: 'Red pen, smooth', price: '1.99' }
    ]);
  });

  await it('should handle escaped quotes inside quotes', async () => {
    const chunks = ['name,quote\nAlice,"She said ""hello"" to me"\n'];
    const parser = new CSVParser();

    const results = [];
    for await (const row of parser.parse(chunks)) {
      results.push(row);
    }

    expect(results).toEqual([
      { name: 'Alice', quote: 'She said "hello" to me' }
    ]);
  });

  await it('should parse CSV without headers returning raw arrays', async () => {
    const chunks = ['Alice,30\nBob,25\n'];
    const parser = new CSVParser({ headers: false });

    const results = [];
    for await (const row of parser.parse(chunks)) {
      results.push(row);
    }

    expect(results).toEqual([
      ['Alice', '30'],
      ['Bob', '25']
    ]);
  });

  await it('should stringify objects back to CSV lines', async () => {
    const data = [
      { name: 'Alice', age: 30, city: 'New York' },
      { name: 'Bob', age: 25, city: 'London' }
    ];

    const stringifier = new CSVStringifier({ headers: ['name', 'age', 'city'] });
    const output = [];
    for await (const line of stringifier.stringify(data)) {
      output.push(line);
    }

    expect(output).toEqual([
      'name,age,city\n',
      'Alice,30,"New York"\n',
      'Bob,25,London\n'
    ]);
  });
});
