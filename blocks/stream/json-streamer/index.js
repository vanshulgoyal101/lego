/**
 * Streaming JSON Parsers
 * Parser utility for Newline-Delimited JSON (NDJSON) and massive JSON arrays.
 */

/**
 * Parses a stream of text chunks containing Newline-Delimited JSON (NDJSON / JSON Lines).
 * @param {Iterable<string>|AsyncIterable<string>} chunkStream
 * @returns {AsyncGenerator<any>}
 */
export async function* ndjsonParser(chunkStream) {
  let buffer = '';
  for await (const chunk of chunkStream) {
    if (typeof chunk !== 'string') continue;
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop(); // save the trailing partial line

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        yield JSON.parse(trimmed);
      }
    }
  }
  const trimmed = buffer.trim();
  if (trimmed) {
    yield JSON.parse(trimmed);
  }
}

/**
 * Parses a stream of text chunks containing a large JSON Array ([ {..}, {..} ])
 * emitting objects as they are parsed without holding the whole array in memory.
 * @param {Iterable<string>|AsyncIterable<string>} chunkStream
 * @returns {AsyncGenerator<any>}
 */
export async function* jsonArrayParser(chunkStream) {
  let inString = false;
  let escapeNext = false;
  let depth = 0;
  let buffer = '';
  let inObject = false;

  for await (const chunk of chunkStream) {
    if (typeof chunk !== 'string') continue;

    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];

      if (inString) {
        buffer += char;
        if (escapeNext) {
          escapeNext = false;
        } else if (char === '\\') {
          escapeNext = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        if (inObject) {
          buffer += char;
        }
        inString = true;
        continue;
      }

      if (char === '{') {
        if (depth === 0) {
          inObject = true;
          buffer = '{';
        } else {
          buffer += char;
        }
        depth++;
        continue;
      }

      if (char === '}') {
        depth--;
        if (inObject) {
          buffer += char;
        }
        if (depth === 0 && inObject) {
          inObject = false;
          try {
            yield JSON.parse(buffer);
          } catch (err) {
            throw new Error(`Failed to parse streamed JSON object: ${err.message}. Content: ${buffer}`);
          }
          buffer = '';
        }
        continue;
      }

      if (inObject) {
        buffer += char;
      }
    }
  }
}
