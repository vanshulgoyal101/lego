import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BLOCKS_DIR = path.join(ROOT_DIR, 'blocks');

async function findMetadataFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });

  for (const file of list) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await findMetadataFiles(res));
    } else if (file.name === 'metadata.json') {
      results.push(res);
    }
  }
  return results;
}

// Generate runtime compatibility matrix based on category
function getCompatibility(category) {
  if (category === 'web' || category === 'ui') {
    return {
      browser: '✅ Supported',
      node: '✅ Supported',
      deno: '✅ Supported',
      bun: '✅ Supported'
    };
  }
  return {
    browser: '✅ Supported',
    node: '✅ Supported',
    deno: '✅ Supported',
    bun: '✅ Supported'
  };
}

function getComplexity(name) {
  switch (name) {
    // ===== algo =====
    case 'binary-search':
      return { time: 'O(log N) per search', space: 'O(1)' };
    case 'sorting':
      return { time: 'O(N log N) QuickSort avg / MergeSort worst', space: 'O(N) merge buffer' };
    case 'graph':
      return { time: 'O(V + E) BFS/DFS traversal', space: 'O(V + E) adjacency list' };
    case 'kmeans':
      return { time: 'O(I × K × N × D) iterations × clusters × points × dimensions', space: 'O(K × D + N)' };
    case 'levenshtein':
      return { time: 'O(N × M) string lengths', space: 'O(N × M) DP table' };
    case 'luhn':
      return { time: 'O(N) digit count', space: 'O(1)' };
    case 'huffman-coding':
      return { time: 'O(N log N) tree build, O(N) encode/decode (N = unique symbols)', space: 'O(N) code table' };
    case 'topological-sort':
      return { time: 'O(V + E) Kahn\'s BFS / DFS', space: 'O(V + E)' };
    case 'segment-tree':
      return { time: 'O(log N) point-update and range-query; O(N) build', space: 'O(N) tree nodes' };
    case 'a-star':
      return { time: 'O(E log V) or O(B^D) depending on grid complexity and heuristic accuracy', space: 'O(V) node structures' };
    case 'dijkstra':
      return { time: 'O(V^2) or O(E log V) with min-priority queue', space: 'O(V + E)' };
    case 'flood-fill':
      return { time: 'O(R × C) grid dimensions', space: 'O(R × C) recursion stack/queue' };
    case 'knapsack':
      return { time: 'O(N × W) number of items × capacity', space: 'O(N × W) DP table' };
    case 'lcs':
      return { time: 'O(N × M) string lengths', space: 'O(N × M) matrix buffer' };
    case 'bellman-ford':
      return { time: 'O(V × E) relaxation cycles', space: 'O(V + E) edges store' };
    case 'floyd-warshall':
      return { time: 'O(V^3) triple loops iteration', space: 'O(V^2) distance matrices' };
    case 'tarjan-scc':
      return { time: 'O(V + E) linear depth search', space: 'O(V) recursion stack' };
    case 'kruskal-mst':
      return { time: 'O(E log E) sorting edges + O(E α(V)) DSU unions', space: 'O(V + E)' };
    case 'prim-mst':
      return { time: 'O(E log V) adjacent paths search', space: 'O(V + E)' };
    case 'page-rank':
      return { time: 'O(I × (V + E)) power iterations count', space: 'O(V) rank buffers' };
    case 'quickselect':
      return { time: 'O(N) average / O(N^2) worst case linear partitions', space: 'O(1) recursion stack' };
    case 'shunting-yard':
      return { time: 'O(N) infix character tokens parsed', space: 'O(N) operator stacks' };

    // ===== async =====
    case 'event-emitter':
      return { time: 'O(L) emit (L = listeners per event)', space: 'O(E × L) event→listener map' };
    case 'promise-pool':
      return { time: 'O(N) total tasks, concurrency-limited', space: 'O(C) active task buffer' };
    case 'semaphore':
      return { time: 'O(1) acquire/release', space: 'O(Q) queued waiters' };
    case 'async-rate-limiter':
      return { time: 'O(1) per execution call check', space: 'O(1)' };
    case 'observable':
      return { time: 'O(1) subscriber operations', space: 'O(S) subscriptions' };
    case 'task-queue':
      return { time: 'O(log N) priority insert/extract', space: 'O(N) queued tasks' };
    case 'timeout-promise':
      return { time: 'O(1) promise race execution', space: 'O(1)' };
    case 'worker-pool':
      return { time: 'O(1) per submit', space: 'O(W + Q) workers and queues' };

    // ===== compiler =====
    case 'json-schema-validator':
      return { time: 'O(P × D) schema properties × data depth', space: 'O(D) recursion stack' };
    case 'regex-engine':
      return { time: 'O(N × M) input × pattern states (NFA simulation)', space: 'O(M) NFA state set' };
    case 'sql-query-parser':
      return { time: 'O(N) characters tokenized linearly', space: 'O(T) token array length' };
    case 'lexer-generator':
      return { time: 'O(N × R) input length × rules match checks', space: 'O(R) rules definition length' };
    case 'ast-walker':
      return { time: 'O(N) node structures traversal depth', space: 'O(D) max recursion stack depth' };

    // ===== crypto =====
    case 'aes':
      return { time: 'O(N) blocks (N = data length / 16)', space: 'O(N) ciphertext buffer' };
    case 'hash':
      return { time: 'O(N) input bytes digested', space: 'O(1) fixed-size output digest' };
    case 'jwt-helper':
      return { time: 'O(N) payload bytes signed/verified', space: 'O(N) encoded token' };
    case 'totp':
      return { time: 'O(W) window validations (W = time window)', space: 'O(1)' };
    case 'uuid-shortener':
      return { time: 'O(1) base conversion arithmetic', space: 'O(1)' };
    case 'hmac':
      return { time: 'O(N) message bytes digested (N = input length)', space: 'O(1)' };
    case 'diffie-hellman':
      return { time: 'O(log E) modular exponentiation', space: 'O(1)' };
    case 'chacha20':
      return { time: 'O(N) data block XOR streams', space: 'O(1) in-place buffer' };
    case 'pbkdf2':
      return { time: 'O(I × N) iterations × key derivation passes', space: 'O(1)' };

    // ===== db =====
    case 'document-db':
      return { time: 'O(N) full scan filter; O(1) indexed lookup', space: 'O(N) stored documents' };
    case 'graph-db':
      return { time: 'O(V log V + E) Dijkstra shortest path', space: 'O(V + E) nodes + edges' };
    case 'json-db':
      return { time: 'O(N) file read/write (N = record count)', space: 'O(N) in-memory table' };
    case 'key-value':
      return { time: 'O(1) get/set via Map', space: 'O(N) stored key count' };
    case 'relational-db':
      return { time: 'O(N × M) join (N rows × M rows); O(N) scan', space: 'O(N) table rows' };
    case 'timeseries-db':
      return { time: 'O(log N) insert (sorted); O(N) range scan', space: 'O(N) metric records' };
    case 'vector-db':
      return { time: 'O(N × D) K-NN brute scan (N = vectors, D = dimensions)', space: 'O(N × D)' };
    case 'lsm-tree':
      return { time: 'O(1) put/delete; O(L log S) search from newest to oldest SSTable', space: 'O(N) keys storage space' };
    case 'wal':
      return { time: 'O(1) append; O(N) recovery parsing', space: 'O(1) append buffer' };
    case 'resp-parser':
      return { time: 'O(N) serialization/deserialization linear scans', space: 'O(N) protocol streams buffer' };

    // ===== ds =====
    case 'binary-search-tree':
      return { time: 'O(log N) avg insert/search; O(N) worst-case unbalanced', space: 'O(N)' };
    case 'bloom-filter':
      return { time: 'O(K) per add/test (K = hash function count)', space: 'O(M) bit array' };
    case 'circular-buffer':
      return { time: 'O(1) push/pop', space: 'O(N) fixed capacity' };
    case 'graph-network':
      return { time: 'O(V log V + E) Dijkstra/A*; O(E log E) Kruskal; O(V + E) Tarjan', space: 'O(V + E)' };
    case 'lru-cache':
      return { time: 'O(1) get/set using Map + doubly-linked list', space: 'O(C) max capacity' };
    case 'priority-queue':
      return { time: 'O(log N) enqueue/dequeue (binary heap)', space: 'O(N)' };
    case 'trie':
      return { time: 'O(L) insert/search (L = string length)', space: 'O(N × L) total stored strings' };
    case 'union-find':
      return { time: 'O(α(N)) per union/find (inverse Ackermann, effectively O(1))', space: 'O(N)' };
    case 'avl-tree':
      return { time: 'O(log N) insert/delete/search guaranteed', space: 'O(N) node records' };
    case 'kd-tree':
      return { time: 'O(log N) avg search/insert (O(N) worst-case)', space: 'O(N) coordinates storage' };
    case 'deque':
      return { time: 'O(1) push/pop operations at both ends', space: 'O(N) elements' };
    case 'interval-tree':
      return { time: 'O(log N + K) interval queries (K = matching intervals)', space: 'O(N)' };
    case 'rope':
      return { time: 'O(log N) string splits/concatenations', space: 'O(N) tree weight nodes' };
    case 'skip-list':
      return { time: 'O(log N) probabilistic lookup/insertion/deletion', space: 'O(N) pointers' };
    case 'sparse-table':
      return { time: 'O(1) range queries after O(N log N) preprocessing', space: 'O(N log N) table size' };
    case 'fenwick-tree':
      return { time: 'O(log N) operations updates/queries', space: 'O(N)' };
    case 'quadtree':
      return { time: 'O(log N) regional queries', space: 'O(N) structures space' };
    case 'hyperloglog':
      return { time: 'O(1) add element checks', space: 'O(m) registers size' };
    case 'count-min-sketch':
      return { time: 'O(d) updates/estimates checks', space: 'O(d × w) 2D array columns size' };
    case 'cuckoo-filter':
      return { time: 'O(1) updates/lookups/deletions checks', space: 'O(C × b) slots capacity' };
    case 'consistent-hash':
      return { time: 'O(log(N × R)) nodes lookup binary search', space: 'O(N × R) ring size' };

    // ===== encoding =====
    case 'base64':
      return { time: 'O(N) bytes encoded/decoded', space: 'O(N) output string' };
    case 'msgpack':
      return { time: 'O(N) bytes serialized/deserialized', space: 'O(N) binary payload' };
    case 'tar-archiver':
      return { time: 'O(N) total bytes packed/unpacked (N = archive size)', space: 'O(N) archive buffer' };
    case 'url-codec':
      return { time: 'O(N) characters encoded/decoded', space: 'O(N) output string' };
    case 'bencode':
      return { time: 'O(N) data traversal parsing/serialization', space: 'O(N) buffers' };
    case 'binary-codec':
      return { time: 'O(N) bits converted', space: 'O(N) representation' };
    case 'json-patch':
      return { time: 'O(P × D) patch instructions × tree depth', space: 'O(D)' };
    case 'run-length':
      return { time: 'O(N) linear scan', space: 'O(N) output' };
    case 'varint':
      return { time: 'O(1) encoding/decoding byte operations', space: 'O(1)' };

    // ===== math =====
    case 'complex':
      return { time: 'O(1) arithmetic; O(log N) power via exp/ln', space: 'O(1)' };
    case 'matrix':
      return { time: 'O(R × C) for most ops; O(N³) matrix multiply', space: 'O(R × C)' };
    case 'prime-generator':
      return { time: 'O(N log log N) Sieve; O(√N) trial division; O(log²N) Miller-Rabin', space: 'O(N) sieve bitmap' };
    case 'random':
      return { time: 'O(1) per random value', space: 'O(1)' };
    case 'stats':
      return { time: 'O(N) mean/sum/variance; O(N log N) median (sort)', space: 'O(N) input copy for sort' };
    case 'symbolic-diff':
      return { time: 'O(N) expression tree nodes (N = AST size)', space: 'O(N) expression tree' };
    case 'vector2d':
      return { time: 'O(1) all vector operations', space: 'O(1)' };
    case 'geometry-2d':
      return { time: 'O(P) points polygon calculation (P = polygon vertices count)', space: 'O(1)' };
    case 'bit-ops':
      return { time: 'O(1) single instruction bits operation', space: 'O(1)' };
    case 'combinatorics':
      return { time: 'O(N! / (N-K)!) permutations and combinations generation', space: 'O(N!) array output' };
    case 'fraction':
      return { time: 'O(log(min(a,b))) Euclidean GCD reduction', space: 'O(1)' };
    case 'interpolation':
      return { time: 'O(N) points evaluation', space: 'O(1)' };
    case 'polynomial':
      return { time: 'O(N × M) coefficients multiplication', space: 'O(N + M)' };

    // ===== ml =====
    case 'decision-tree':
      return { time: 'O(N × D × log N) training (N = samples, D = features); O(log N) predict', space: 'O(N × D) training data' };
    case 'knn':
      return { time: 'O(N × D) per prediction (brute-force distance)', space: 'O(N × D) training set' };
    case 'neural-network':
      return { time: 'O(E × N × L²) training (E = epochs, N = samples, L = layer size)', space: 'O(L²) weights' };
    case 'linear-regression':
      return { time: 'O(E × N × D) gradient descent iterations', space: 'O(D) weights' };
    case 'logistic-regression':
      return { time: 'O(E × N × D) gradient descent iterations', space: 'O(D) weights' };
    case 'naive-bayes':
      return { time: 'O(N × L + V) training; O(D × V) classification', space: 'O(C × V) class term frequencies' };
    case 'svm':
      return { time: 'O(E × N) training epochs approximation; O(D) prediction', space: 'O(D) weights' };
    case 'pca':
      return { time: 'O(D² × N + D³) covariance + SVD solver', space: 'O(D²) projection mapping' };
    case 'dbscan':
      return { time: 'O(N²) distance evaluations', space: 'O(N) neighbor queues' };
    case 'random-forest':
      return { time: 'O(T × N × D × log N) tree builds', space: 'O(T × Nodes) ensemble storage' };
    case 'tf-idf':
      return { time: 'O(N × L) document tokenization; O(N × V) encoding matrix', space: 'O(V) vocabulary dictionary size' };
    case 'cosine-similarity':
      return { time: 'O(D) vector dimensions calculation; O(N² × D) pairwise', space: 'O(N²) matrix output' };

    // ===== protocol =====
    case 'dns-resolver':
      return { time: 'O(N) packet bytes serialized/parsed', space: 'O(N) packet buffer' };

    // ===== state =====
    case 'fsm':
      return { time: 'O(1) state transition (Map lookup)', space: 'O(V + E) states and transitions' };
    case 'redux-lite':
      return { time: 'O(1) dispatch; O(L) notify listeners (L = subscriber count)', space: 'O(L) listener registry' };
    case 'atom':
      return { time: 'O(1) get/set subscription notifier operations', space: 'O(L) list of subscribers' };
    case 'command-pattern':
      return { time: 'O(1) execute/undo/redo transitions', space: 'O(H) history list size' };
    case 'history-manager':
      return { time: 'O(1) push/replace/go navigation state updates', space: 'O(H) history entries' };
    case 'observable-store':
      return { time: 'O(1) get/set trigger; O(L) subscriber dispatch', space: 'O(L)' };
    case 'signal':
      return { time: 'O(1) read/write; O(D) reactive graph propagation depth', space: 'O(D)' };

    // ===== text =====
    case 'csv-parser':
      return { time: 'O(N) characters parsed linearly', space: 'O(N) parsed rows' };
    case 'diff-match':
      return { time: 'O(N × M) Myers diff algorithm (N, M = string lengths)', space: 'O(N + M) edit path' };
    case 'ini-parser':
      return { time: 'O(N) lines parsed linearly', space: 'O(K) key-value pairs stored' };
    case 'json-serializer':
      return { time: 'O(N) object nodes traversed', space: 'O(N) serialized string' };
    case 'json5-parser':
      return { time: 'O(N) characters tokenized and parsed', space: 'O(N) parse tree' };
    case 'markdown-compiler':
      return { time: 'O(N) lines → AST nodes', space: 'O(N) AST tree' };
    case 'markdown-parser':
      return { time: 'O(N × R) input length × rule count (regex passes)', space: 'O(N) output HTML' };
    case 'parser-combinator':
      return { time: 'O(N) characters consumed sequentially', space: 'O(D) recursion call depth' };
    case 'yaml-parser':
      return { time: 'O(N) lines parsed linearly', space: 'O(N) resulting object tree' };
    case 'slugify':
      return { time: 'O(N) character conversion normalize operations', space: 'O(N) output string path' };
    case 'ansi':
      return { time: 'O(N) character string parsed/styled', space: 'O(N)' };
    case 'edit-distance':
      return { time: 'O(N × M) edit metrics mapping matrix', space: 'O(N + M) buffer' };
    case 'string-search':
      return { time: 'O(N + M) linear pattern matching search times', space: 'O(M)' };
    case 'tokenizer':
      return { time: 'O(N) parsed symbols', space: 'O(N) tokens' };
    case 'word-wrap':
      return { time: 'O(N) characters formatted', space: 'O(N) text block output' };

    // ===== ui =====
    case 'color-converter':
      return { time: 'O(1) arithmetic conversions', space: 'O(1)' };
    case 'query-builder':
      return { time: 'O(C) conditions assembled (C = clause count)', space: 'O(C) query string' };
    case 'virtual-dom':
      return { time: 'O(N) diff/patch (N = tree nodes); O(N) SSR render', space: 'O(N) VNode tree' };

    // ===== utils =====
    case 'date-formatter':
      return { time: 'O(F) format tokens (F = format string length)', space: 'O(1)' };
    case 'debounce':
      return { time: 'O(1) per call (timer reset)', space: 'O(1)' };
    case 'deep-clone':
      return { time: 'O(N) object nodes traversed', space: 'O(N) cloned structure' };
    case 'memoize':
      return { time: 'O(1) cache hit; O(F) cache miss (F = wrapped function cost)', space: 'O(K) cached keys' };
    case 'object-diff':
      return { time: 'O(N) keys compared recursively (N = total key count)', space: 'O(N) change records' };
    case 'pubsub':
      return { time: 'O(S × P) publish (S = subscribers, P = pattern match per subscriber)', space: 'O(S + H) subscribers + history' };
    case 'retry':
      return { time: 'O(A) attempts (A = max retries)', space: 'O(1)' };
    case 'throttle':
      return { time: 'O(1) per call (timer check)', space: 'O(1)' };
    case 'uuid-v4':
      return { time: 'O(1) crypto random generation', space: 'O(1)' };
    case 'chunk':
      return { time: 'O(N) items sliced', space: 'O(N) chunk list' };
    case 'color-utils':
      return { time: 'O(1) rgb conversion calculation', space: 'O(1)' };
    case 'deep-merge':
      return { time: 'O(N) combined objects keys size', space: 'O(N)' };
    case 'event-bus':
      return { time: 'O(1) dispatch registration listener checks', space: 'O(L) listeners map' };
    case 'flatten':
      return { time: 'O(N) nested elements count', space: 'O(D) depth array copy' };
    case 'pick-omit':
      return { time: 'O(K) keys filter selection list', space: 'O(K)' };
    case 'size-formatter':
      return { time: 'O(1) byte calculation parsing', space: 'O(1)' };
    case 'string-utils':
      return { time: 'O(N) string processing operations', space: 'O(N)' };
    case 'template-engine':
      return { time: 'O(N) template length compiles', space: 'O(V) template expressions' };

    // ===== validation =====
    case 'email-rfc5322':
      return { time: 'O(N) characters validated (N = email length)', space: 'O(1)' };
    case 'ip-validator':
      return { time: 'O(1) fixed-format check', space: 'O(1)' };
    case 'jwt-validator':
      return { time: 'O(N) payload bytes verified (N = token length)', space: 'O(N) decoded payload' };
    case 'rate-limiter':
      return { time: 'O(1) token-bucket check per request', space: 'O(C) client state records' };
    case 'schema-validator':
      return { time: 'O(P) schema properties validated', space: 'O(P) error collection' };
    case 'semver':
      return { time: 'O(1) parse/compare; O(N log N) sort (N = version count)', space: 'O(N) sorted array' };
    case 'xss-filter':
      return { time: 'O(N) HTML characters scanned', space: 'O(N) sanitized output string' };
    case 'password-strength':
      return { time: 'O(N) password check rules validation (N = length)', space: 'O(1)' };
    case 'credit-card':
      return { time: 'O(N) card validation luhn checks', space: 'O(1)' };
    case 'date-validator':
      return { time: 'O(F) custom date pattern string matches', space: 'O(1)' };
    case 'json-path':
      return { time: 'O(P × D) segments lookup path traversal depth', space: 'O(D)' };
    case 'phone-validator':
      return { time: 'O(N) patterns match check phone validations', space: 'O(1)' };
    case 'url-validator':
      return { time: 'O(N) components url length checks', space: 'O(1)' };
    case 'cron-parser':
      return { time: 'O(D) cron intervals validation search steps', space: 'O(1)' };

    // ===== web =====
    case 'api-client':
      return { time: 'O(1) per request dispatch', space: 'O(1)' };
    case 'cookie-helper':
      return { time: 'O(N) cookie string parsed (N = length)', space: 'O(K) cookie key-value pairs' };
    case 'fetch-retry':
      return { time: 'O(A) retry attempts', space: 'O(1)' };
    case 'http-client-resilient':
      return { time: 'O(1) per request; O(C) cache lookup', space: 'O(C) response cache entries' };
    case 'http-server':
      return { time: 'O(R) route matching (R = registered routes)', space: 'O(R) route registry' };
    case 'oauth2-client':
      return { time: 'O(1) PKCE generation (SHA-256 is O(N) input bytes)', space: 'O(1)' };
    case 'router':
      return { time: 'O(R × P) route scan (R = routes, P = path segments)', space: 'O(R)' };
    case 'sse-client':
      return { time: 'O(1) per event dispatch', space: 'O(1)' };
    case 'websocket-client':
      return { time: 'O(1) send; O(M) offline queue drain (M = buffered messages)', space: 'O(M) outbox queue' };
    case 'static-server':
      return { time: 'O(1) persistent request response cycle', space: 'O(1)' };
    case 'cors-middleware':
      return { time: 'O(1) rules match verification', space: 'O(1)' };
    case 'multipart-parser':
      return { time: 'O(N) body data size buffer linear scan', space: 'O(N) data parts extraction' };
    case 'url-template':
      return { time: 'O(P) variables replacement operations', space: 'O(1)' };
    case 'doh-client':
      return { time: 'O(1) network fetch delay', space: 'O(1)' };
    case 'session-manager':
      return { time: 'O(N) digest sign/unsign validation signature bytes', space: 'O(1)' };
    case 'tcp-client-server':
      return { time: 'O(1) network event loops', space: 'O(C) active client socket connections' };
    case 'graphql-client':
      return { time: 'O(1) fetch response delay', space: 'O(1)' };
    case 'rate-limiter-token-bucket':
      return { time: 'O(1) token consumption verify checks', space: 'O(U) active user keys capacity map' };

    default:
      // Prevent silent errors when new blocks are added to the repo
      throw new Error(`[README Generator Error] Block "${name}" has no complexity mapping defined in getComplexity(). Please add it to "tools/generate-readmes.js".`);
  }
}

async function generateReadmes() {
  try {
    console.log('Generating Lego Block README files...');
    const metadataPaths = await findMetadataFiles(BLOCKS_DIR);

    for (const metaPath of metadataPaths) {
      const dirPath = path.dirname(metaPath);
      const relativeDir = path.relative(BLOCKS_DIR, dirPath);
      const parts = relativeDir.split(path.sep);
      
      const category = parts[0];
      const name = parts.slice(1).join('/');
      const blockKey = `${category}/${name}`;

      const content = await fs.readFile(metaPath, 'utf8');
      const metadata = JSON.parse(content);

      const comp = getCompatibility(category);
      const compl = getComplexity(metadata.name);

      let paramsMarkdown = '*None*';
      if (metadata.parameters && metadata.parameters.length > 0) {
        paramsMarkdown = `| Parameter | Type | Required | Default | Description |\n|---|---|---|---|---|\n`;
        metadata.parameters.forEach(p => {
          const req = p.required ? '⚠️ Yes' : 'No';
          const def = p.default !== undefined ? `\`${p.default}\`` : '*-*';
          paramsMarkdown += `| \`${p.name}\` | \`${p.type}\` | ${req} | ${def} | ${p.description} |\n`;
        });
      }

      const readmeContent = `# Lego Block: \`${blockKey}\`

${metadata.description}

> [!NOTE]
> **AI Agent Context:** ${metadata.aiPromptContext || 'Use this block as a modular dependency.'}

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
\`\`\`bash
npx lego-cli add ${blockKey}
\`\`\`

---

## API Specifications

### Parameters

${paramsMarkdown}

---

## System Compatibility

| Runtime Environment | Status |
|---|---|
| **Browsers (Chrome, Safari, Firefox, Edge)** | ${comp.browser} |
| **Node.js** | ${comp.node} |
| **Deno** | ${comp.deno} |
| **Bun** | ${comp.bun} |

---

## Computational Complexity

* **Time Complexity:** \`${compl.time}\`
* **Space Complexity:** \`${compl.space}\`

---

## Production Usage Example

Refer to \`index.js\` inside this folder for full API details.
`;

      const readmePath = path.join(dirPath, 'README.md');
      await fs.writeFile(readmePath, readmeContent, 'utf8');
      console.log(`  + Created: ${path.relative(ROOT_DIR, readmePath)}`);
    }

    console.log('All README files generated successfully!');
  } catch (error) {
    console.error('Error generating README files:', error);
    process.exit(1);
  }
}

generateReadmes();
