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
    case 'kmp-search':
      return { time: 'O(N + M) matching time (N = text length, M = pattern length)', space: 'O(M) prefix LPS array' };
    case 'boyer-moore':
      return { time: 'O(N + M) average / O(N × M) worst case matching', space: 'O(A) alphabet shift map' };
    case 'rabin-karp':
      return { time: 'O(N + M) average / O(N × M) worst case matching', space: 'O(1)' };
    case 'ford-fulkerson':
      return { time: 'O(E × f) where f is max flow, or O(V × E^2) Edmonds-Karp complexity', space: 'O(V + E) residual capacities' };
    case 'tsp-solver':
      return { time: 'O(N!) worst-case backtracking permutations search', space: 'O(N) recursion stack' };

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
    case 'cron-scheduler':
      return { time: 'O(1) register; recursive O(D) next run checks', space: 'O(J) scheduled jobs handles' };


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
    case 'bf-compiler':
      return { time: 'O(N) source transpile / VM operations', space: 'O(M) memory array size (30,000 bytes)' };
    case 'parser-generator':
      return { time: 'O(V + T) grammar rules compilation; O(N) parser speed (N = input length)', space: 'O(P) parse tree size' };



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
    case 'rsa-light':
      return { time: 'O(log E) modular exponentiation', space: 'O(1)' };
    case 'poly1305':
      return { time: 'O(N) message bytes processed', space: 'O(1)' };

    case 'diffie-hellman':
      return { time: 'O(log E) modular exponentiation', space: 'O(1)' };
    case 'chacha20':
      return { time: 'O(N) data block XOR streams', space: 'O(1) in-place buffer' };
    case 'pbkdf2':
      return { time: 'O(I × N) iterations × key derivation passes', space: 'O(1)' };
    case 'scrypt':
      return { time: 'O(N × r × p) iterations count times block size times parallelization', space: 'O(128 × r × N) memory cost bytes' };
    case 'sha3':
      return { time: 'O(N) message bytes digested (Keccak-f[1600] permutations)', space: 'O(1) state array (1600 bits)' };

    case 'rc4':
      return { time: 'O(N) message bytes processed', space: 'O(1) state array' };
    case 'bcrypt-lite':
      return { time: 'O(2^R × N) where R is cost factor rounds and N is derived key passes', space: 'O(1) work memory' };

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
    case 'sql-builder':
      return { time: 'O(N) SQL segments assembly', space: 'O(N) query components string buffer' };
    case 'page-cache':
      return { time: 'O(1) read/write hit; O(P) page eviction flush worst case', space: 'O(C × P) page buffers in memory' };

    case 'lsm-tree':
      return { time: 'O(1) put/delete; O(L log S) search from newest to oldest SSTable', space: 'O(N) keys storage space' };
    case 'wal':
      return { time: 'O(1) append; O(N) recovery parsing', space: 'O(1) append buffer' };
    case 'resp-parser':
      return { time: 'O(N) serialization/deserialization linear scans', space: 'O(N) protocol streams buffer' };
    case 'migration-engine':
      return { time: 'O(M) where M is pending/applied migrations count', space: 'O(M) memory list' };

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
    case 'min-max-heap':
      return { time: 'O(log N) push/pop; O(1) peekMin/peekMax', space: 'O(N) internal heap list' };
    case 'b-tree':
      return { time: 'O(log N) insert, delete, search (base degree M)', space: 'O(N) keys and child pointers' };
    case 'splay-tree':
      return { time: 'O(log N) amortized search, insert, delete', space: 'O(N) node pointers' };

    case 'octree':
      return { time: 'O(log N) average insert/query; O(N) worst case', space: 'O(N) nodes and points' };
    case 'treap':
      return { time: 'O(log N) expected search/insert/delete; O(N) worst case', space: 'O(N) tree nodes' };
    case 'red-black-tree':
      return { time: 'O(log N) search/insert/delete worst-case bounds', space: 'O(N) tree nodes' };

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
    case 'protobuf-decoder':
      return { time: 'O(N) binary stream parse passes', space: 'O(N) parsed fields array' };
    case 'utf8-validator':
      return { time: 'O(N) byte buffer linear scans', space: 'O(1)' };
    case 'hex':
      return { time: 'O(N) encoding and decoding operations (N = input length)', space: 'O(N) output string/buffer' };


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
    case 'linear-equations':
      return { time: 'O(N³) elimination iterations', space: 'O(N²) augmented matrix buffer' };
    case 'numerical-integration':
      return { time: 'O(N) intervals function evaluations', space: 'O(1)' };

    case 'bezier':
      return { time: 'O(N) curve points generation (N = sample resolution)', space: 'O(N) output coordinates array' };
    case 'fft':
      return { time: 'O(N log N) Cooley-Tukey transformation time', space: 'O(N) computation arrays' };
    case 'signal-filter':
      return { time: 'O(N) sample size linear execution', space: 'O(P) state filter order history' };
    case 'bigint-fraction':
      return { time: 'O(log(min(a,b))) Euclidean GCD canonical reduction', space: 'O(1)' };


    case 'quaternion':
      return { time: 'O(1) rotations, additions, multiplications', space: 'O(1)' };
    case 'statistics-advanced':
      return { time: 'O(N) calculations (t-test / ANOVA groups size)', space: 'O(1)' };

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
    case 'perceptron':
      return { time: 'O(E × N × D) epochs × samples × dimensions', space: 'O(D) weights' };

    // ===== protocol =====
    case 'dns-resolver':
      return { time: 'O(N) packet bytes serialized/parsed', space: 'O(N) packet buffer' };
    case 'mqtt-client':
      return { time: 'O(N) packet serialization/parsing (N = length)', space: 'O(B) active message stream buffer' };
    case 'websocket-frame':
      return { time: 'O(N) frame payload encoding/decryption with mask key', space: 'O(N) frame payload bytes buffer' };
    case 'grpc-encoder':
      return { time: 'O(N) prefix framing data copy operations', space: 'O(N) frame payload bytes buffer' };
    case 'coap-parser':
      return { time: 'O(N) parsing binary packet options', space: 'O(N) message buffer' };

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
    case 'html-parser':
      return { time: 'O(N) characters parsed linearly', space: 'O(D) maximum nesting stack depth' };
    case 'bbcode-parser':
      return { time: 'O(N) linear character scan (N = input length)', space: 'O(D) tag stack nesting depth' };
    case 'markdown-table':
      return { time: 'O(R × C) rows × columns formatting', space: 'O(R × C) cell strings cache' };
    case 'xml-parser':
      return { time: 'O(N) tokenizer and AST assembly linear scan', space: 'O(D) maximum XML tags nesting stack depth' };



    // ===== ui =====
    case 'color-converter':
      return { time: 'O(1) arithmetic conversions', space: 'O(1)' };
    case 'query-builder':
      return { time: 'O(C) conditions assembled (C = clause count)', space: 'O(C) query string' };
    case 'virtual-dom':
      return { time: 'O(N) diff/patch (N = tree nodes); O(N) SSR render', space: 'O(N) VNode tree' };
    case 'css-parser':
      return { time: 'O(N) character scanner loops (N = input length)', space: 'O(R + D) rules and declarations' };
    case 'svg-generator':
      return { time: 'O(N) shape components rendering', space: 'O(N) SVG XML strings' };
    case 'spring-physics':
      return { time: 'O(1) animation physics state update', space: 'O(1)' };
    case 'canvas-charts':
      return { time: 'O(N) data items render loops', space: 'O(1)' };

    // ===== media =====
    case 'wav-decoder':
      return { time: 'O(S × C) samples × channels parsing iteration', space: 'O(S × C) normalized float channels data' };
    case 'bmp-encoder':
      return { time: 'O(W × H) pixels encoding loop', space: 'O(W × H) binary file buffer' };
    case 'png-metadata':
      return { time: 'O(C) chunks scan', space: 'O(1)' };
    case 'gif-metadata':
      return { time: 'O(F) frame block scan', space: 'O(F) frame descriptor properties' };
    case 'mp3-id3-parser':
      return { time: 'O(T) ID3 tag size parser', space: 'O(T) tag metadata headers' };

    // ===== sys =====
    case 'path-resolver':
      return { time: 'O(N) path segments resolution and normalizations', space: 'O(N) normalized output path string' };
    case 'env-parser':
      return { time: 'O(N) lines parsed linearly (N = file line count)', space: 'O(K) key-value configuration entries' };
    case 'terminal-ansi':
      return { time: 'O(1) styling formatting; O(N) regex strip pattern match', space: 'O(N) output stylized/stripped string' };


    // ===== utils =====
    case 'date-formatter':
      return { time: 'O(F) format tokens (F = format string length)', space: 'O(1)' };
    case 'debounce':
      return { time: 'O(1) per call (timer reset)', space: 'O(1)' };
    case 'deep-clone':
      return { time: 'O(N) object nodes traversed', space: 'O(N) cloned structure' };
    case 'memoize':
      return { time: 'O(1) cache hit; O(F) cache miss (F = wrapped function cost)', space: 'O(K) cached keys' };
    case 'once':
      return { time: 'O(1) per invocation after first execution', space: 'O(1) cached first result' };
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
    case 'dependency-resolver':
      return { time: 'O(V + E) where V is nodes and E is dependencies', space: 'O(V + E) graph and visited state' };
    case 'pubsub-wildcard':
      return { time: 'O(N × L) topic regex checks (N = subscribers, L = pattern size)', space: 'O(N) patterns registry' };
    case 'url-builder':
      return { time: 'O(K) query parameter keys serialized/parsed', space: 'O(K) key-value storage' };


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
    case 'isbn':
      return { time: 'O(1) fixed check digit iteration scans', space: 'O(1)' };
    case 'mime-detector':
      return { time: 'O(1) signature comparison matches; O(T) text parsing heuristic', space: 'O(1)' };
    case 'sql-injection-detector':
      return { time: 'O(N × R) input length × rule count (regex passes)', space: 'O(1)' };
    case 'json-sanitizer':
      return { time: 'O(N) character scanner loops (N = input length)', space: 'O(N) cleaned string' };
    case 'cors':
      return { time: 'O(O + M + H) origin list × allowed methods × requested headers validations', space: 'O(1) output headers map' };


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
    case 'reverse-proxy':
      return { time: 'O(1) request streaming proxy overhead', space: 'O(1)' };
    case 'load-balancer':
      return { time: 'O(1) routing selection; O(H × T) background health checks', space: 'O(T) targets state map' };
    case 'http-client-curl':
      return { time: 'O(H + B) formatting overhead (H = headers, B = body size)', space: 'O(H + B) command string buffer' };
    case 'doh-server':
      return { time: 'O(1) request processing overhead', space: 'O(C) active TCP client connections' };

    // ===== agent =====
    case 'prompt-template':
      return { time: 'O(T + V × L) template structure length + variables size', space: 'O(T + V)' };
    case 'tool-registry':
      return { time: 'O(P) properties schema check on tool registry dispatch', space: 'O(T) registered tools database' };
    case 'memory-buffer':
      return { time: 'O(M) memory history buffer truncation evaluation', space: 'O(M) message logs storage' };
    case 'chain-runner':
      return { time: 'O(S) steps runner execution count', space: 'O(S) context step tracking maps' };
    case 'structured-output':
      return { time: 'O(N) malformed json parse tries', space: 'O(N)' };
    case 'react-loop':
      return { time: 'O(I) thought-action iteration loops count', space: 'O(M) agent memory history records' };
    case 'retrieval-context':
      return { time: 'O(N × Q) chunk search cosine ranking (N = chunks, Q = query terms)', space: 'O(C) memory chunks data structures' };
    case 'decision-tree-agent':
      return { time: 'O(D) rule conditions checks evaluation depth', space: 'O(D)' };
    // ===== observability =====
    case 'span-tracer':
      return { time: 'O(1) span creation and tracking', space: 'O(N) active trace spans stored' };
    case 'metrics-registry':
      return { time: 'O(1) metrics registration and update', space: 'O(M) tracked metrics storage' };
    case 'log-formatter':
      return { time: 'O(N) serialization overhead for log message and metadata', space: 'O(1)' };
    case 'health-check':
      return { time: 'O(C) health checks aggregation execution', space: 'O(C) registered check definitions' };
    case 'error-aggregator':
      return { time: 'O(1) deduplication and fingerprint lookup', space: 'O(E) unique active errors tracking' };
    case 'perf-profiler':
      return { time: 'O(1) start/end profile measurement; O(S) tree formatting', space: 'O(S) active call stack samples' };

    // ===== stream =====
    case 'pipeline':
      return { time: 'O(N × P) data size × pipeline stage count', space: 'O(P) active stages callbacks' };
    case 'batch-processor':
      return { time: 'O(N) processing time', space: 'O(B) items buffer where B is batch size' };
    case 'schema-mapper':
      return { time: 'O(F) mapped fields conversion iterations', space: 'O(F) schema layout definitions' };
    case 'csv-streamer':
      return { time: 'O(C) parsed characters scan', space: 'O(L) current row string length' };
    case 'json-streamer':
      return { time: 'O(C) parsed JSON characters scan', space: 'O(J) current JSON line size' };
    case 'deduplicator':
      return { time: 'O(1) item presence query check', space: 'O(S) unique seen items storage size' };
    case 'windowed-aggregator':
      return { time: 'O(E) window check items update', space: 'O(W) current window items storage' };

    // ===== security =====
    case 'secret-manager':
      return { time: 'O(1) retrieval/store, O(N) encryption/decryption', space: 'O(S) encrypted secrets count' };
    case 'csp-builder':
      return { time: 'O(D × V) directive list size', space: 'O(D) directive storage size' };
    case 'sanitizer':
      return { time: 'O(N) input string length scan', space: 'O(N) output clean string' };
    case 'api-key-manager':
      return { time: 'O(1) validation check', space: 'O(K) active keys database' };
    case 'audit-logger':
      return { time: 'O(E) validation of entry chain', space: 'O(E) log entries database' };
    case 'permission-engine':
      return { time: 'O(R × P) role context evaluation', space: 'O(R) hierarchy tree definition' };

    // ===== sys =====
    case 'file-watcher':
      return { time: 'O(F) checked files loop', space: 'O(F) file state snapshot registry' };
    case 'process-monitor':
      return { time: 'O(1) process metrics sampling', space: 'O(S) sample trace buffer size' };
    case 'config-loader':
      return { time: 'O(S × D) config sources deep merge', space: 'O(C) merged configuration state' };
    case 'cli-builder':
      return { time: 'O(A) command arguments parse', space: 'O(F) declared flags configuration' };
    case 'plugin-loader':
      return { time: 'O(P log P) plugin dependency sorting', space: 'O(P) registered plugin modules database' };

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
