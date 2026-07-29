# Lego Code Library

> AI-Optimized, Universal, Zero-Dependency Reusable Code Blocks for Modern Software Engines.

Traditional package managers (npm, pip, cargo) were designed for human workflows. They enforce heavy dependency trees, version conflict resolution, configuration bloat, and rigid imports. 

**Lego** is designed for the future of AI-assisted and human pair-programming. It is a repository of highly modular, self-contained, crash-proof, and universally compatible code components ("Lego Blocks") that are designed to be copied directly into your workspace.

---

## Key Pillars

* **Zero Transitive Dependencies:** Each block is self-contained. Adding a block will never pull in third-party packages, preventing version collision.
* **Universal Environment Compatibility:** Zero node-internal dependencies. All blocks use standard Web APIs (`TextEncoder`, `Uint8Array`, Web Crypto) allowing them to run natively on **Browsers**, **Node.js**, **Deno**, and **Bun**.
* **Crash-Proof Design:** Robust error validation and recovery (such as automatic database corruption repair and safe JSON serialization) to ensure production-grade reliability.
* **Semantic Documentation:** Every block is documented with JSDocs, Big-O computational complexity analysis, and LLM-friendly context prompting.

---

## Interactive Documentation Web Interface

The library features a responsive, high-performance, dark-themed interactive documentation viewer to explore parameters, complexities, system compatibility, source codes, and AI integration guidelines in a beautiful dashboard.

To view it, simply open [docs/index.html](file:///Users/vanshulgoyal/Development/lego/docs/index.html) in your browser:
```bash
# Open directly via terminal
open docs/index.html
```

---

## Command Line Interface (CLI)

The repository includes a helper CLI tool (`lego-cli`) that allows you or your AI agent to discover, inspect, and copy code blocks:

```bash
# List all available blocks in the library
node bin/cli.js list

# Search blocks by keyword/category/description
node bin/cli.js search websocket

# View detailed parameter documentation and AI instructions
node bin/cli.js view web/fetch-retry

# Copy a block directly into your project's codebase
node bin/cli.js add web/fetch-retry --dest ./src/utils

# Copy block code plus its README
node bin/cli.js add web/fetch-retry --dest ./src/utils --with-readme

# Validate registry and block-file integrity
node bin/cli.js doctor
```

---

## Categorized Block Catalog

We have developed **327 production-grade blocks** organized across 23 categories:

### 1. Agent
* [`agent/chain-runner`](blocks/agent/chain-runner): Sequential/branching chain executor for AI agents where each step receives context and returns updated context, with retry, skip, and conditional branching support.
* [`agent/decision-tree-agent`](blocks/agent/decision-tree-agent): A rule-based decision tree agent that evaluates prioritized condition-action rules against a context object and executes the highest-priority matching action.
* [`agent/memory-buffer`](blocks/agent/memory-buffer): Sliding context window memory manager for AI agents that tracks conversation history, estimates token usage, and supports summarization when the context limit is approached.
* [`agent/prompt-template`](blocks/agent/prompt-template): Handlebars-style LLM prompt builder with {{variable}} slot filling, few-shot example injection, multi-role message construction (system/user/assistant), and token estimation.
* [`agent/react-loop`](blocks/agent/react-loop): ReAct (Reasoning + Acting) loop implementation for AI agents. Runs Thought → Action → Observation cycles with tool dispatch, message history tracking, and configurable max iterations.
* [`agent/retrieval-context`](blocks/agent/retrieval-context): Builds retrieval-augmented generation (RAG) context by chunking documents, scoring chunks against a query with TF-IDF cosine similarity, and injecting the top-K results into a prompt.
* [`agent/routing-agent`](blocks/agent/routing-agent): A routing agent that classifies user prompts and messages, directing them to specialized sub-agents, tools, or handlers using keyword matching, regex rules, custom scoring functions, or semantic vector comparison.
* [`agent/structured-output`](blocks/agent/structured-output): Parses and validates LLM text outputs that are supposed to be JSON, handling markdown code fences, malformed JSON, schema validation, and retry logic.
* [`agent/tool-registry`](blocks/agent/tool-registry): A registry for AI agent callable tools with JSON Schema parameter validation, named dispatch, and LLM function-calling compatible listing.

### 2. Algorithms
* [`algo/a-star`](blocks/algo/a-star): A* pathfinding algorithm on a 2D grid that finds the shortest path using heuristic-guided search.
* [`algo/bellman-ford`](blocks/algo/bellman-ford): Calculates shortest paths from a single source vertex to all other vertices in a weighted graph, supporting negative edge weights and detecting negative cycles.
* [`algo/binary-search`](blocks/algo/binary-search): Binary search algorithm helper for sorted arrays with custom comparator support.
* [`algo/boyer-moore`](blocks/algo/boyer-moore): Boyer-Moore substring search algorithm utilizing the bad character heuristic table for right-to-left pattern matching scans.
* [`algo/dijkstra`](blocks/algo/dijkstra): Dijkstra's shortest-path algorithm on a weighted adjacency list graph returning distances and predecessors from a source node.
* [`algo/flood-fill`](blocks/algo/flood-fill): Flood fill and boundary fill algorithms for 2D grids, similar to a paint-bucket tool, returning a modified grid copy.
* [`algo/floyd-warshall`](blocks/algo/floyd-warshall): Calculates shortest paths between all pairs of vertices in a weighted graph, supporting negative edge weights.
* [`algo/ford-fulkerson`](blocks/algo/ford-fulkerson): Computes the maximum flow in a flow network using the Edmonds-Karp algorithm (breadth-first search for finding augmenting paths).
* [`algo/graph`](blocks/algo/graph): Standard Graph data structure class supporting DFS, BFS, and Dijkstra pathfinding operations.
* [`algo/huffman-coding`](blocks/algo/huffman-coding): Huffman Coding compression helper that constructs a frequency tree, generates prefix codes, and supports encoding/decoding of arbitrary text.
* [`algo/kmeans`](blocks/algo/kmeans): K-Means clustering algorithm for classifying multi-dimensional numerical coordinate vectors.
* [`algo/kmp-search`](blocks/algo/kmp-search): Knuth-Morris-Pratt (KMP) substring matching algorithm that precomputes a prefix/LPS table to perform O(N+M) string searches.
* [`algo/knapsack`](blocks/algo/knapsack): 0/1 Knapsack dynamic programming solver that selects items to maximise total value within a weight capacity.
* [`algo/kruskal-mst`](blocks/algo/kruskal-mst): Finds a Minimum Spanning Tree of an undirected weighted graph using Kruskal's algorithm and a Disjoint Set Union (DSU) helper.
* [`algo/lcs`](blocks/algo/lcs): Longest Common Subsequence algorithm returning the subsequence, its length, and a 0–1 similarity ratio between two sequences.
* [`algo/levenshtein`](blocks/algo/levenshtein): Levenshtein distance (edit distance) metric calculator to measure string similarity percentage.
* [`algo/luhn`](blocks/algo/luhn): Luhn algorithm checksum validator (Mod 10 check) for credit card or IMEI numbers validation.
* [`algo/page-rank`](blocks/algo/page-rank): Calculates PageRank score distributions for nodes in a graph using iterative power method updates.
* [`algo/prim-mst`](blocks/algo/prim-mst): Finds a Minimum Spanning Tree of an undirected weighted graph starting from a node using Prim's algorithm.
* [`algo/quickselect`](blocks/algo/quickselect): Finds the k-th smallest element in an unsorted array in O(N) average time using selection partitioning.
* [`algo/rabin-karp`](blocks/algo/rabin-karp): Rabin-Karp substring pattern matching algorithm utilizing rolling hashes and character collision verification checks.
* [`algo/segment-tree`](blocks/algo/segment-tree): A range-query data structure (Segment Tree) supporting point updates and range queries (sum, min, max) in O(log n) time. Supports lazy propagation for range updates. Useful for interval queries, competitive programming, and database range aggregation.
* [`algo/shunting-yard`](blocks/algo/shunting-yard): Converts mathematical infix notation strings into Reverse Polish Notation (RPN) / Postfix expressions using Djikstra's shunting-yard algorithm.
* [`algo/sorting`](blocks/algo/sorting): Production-grade sorting algorithms (QuickSort and MergeSort) supporting custom comparator functions.
* [`algo/tarjan-scc`](blocks/algo/tarjan-scc): Finds strongly connected components in a directed graph using Tarjan's single-pass DFS algorithm.
* [`algo/topological-sort`](blocks/algo/topological-sort): Topological sort for Directed Acyclic Graphs (DAGs). Implements both Kahn's BFS algorithm and DFS-based approaches. Detects cycles and throws a descriptive error. Used for dependency resolution, task scheduling, and build systems.
* [`algo/tsp-solver`](blocks/algo/tsp-solver): Backtracking Travelling Salesperson Problem (TSP) shortest tour path solver.

### 3. Application Helpers
* [`app/batch-promises`](blocks/app/batch-promises): Runs async work in fixed-size batches to control burst load.
* [`app/chunk-while`](blocks/app/chunk-while): Chunks list while consecutive items satisfy relation predicate.
* [`app/compact`](blocks/app/compact): Removes nullish values from an array.
* [`app/create-latch`](blocks/app/create-latch): Creates a countdown latch that resolves when count reaches zero.
* [`app/csv-escape`](blocks/app/csv-escape): Escapes values for safe CSV column output.
* [`app/deep-freeze`](blocks/app/deep-freeze): Recursively freezes objects and arrays to enforce runtime immutability.
* [`app/defer`](blocks/app/defer): Creates deferred promise controls (promise, resolve, reject).
* [`app/elapsed-timer`](blocks/app/elapsed-timer): High-resolution elapsed timer utility for performance measurements.
* [`app/email-basic`](blocks/app/email-basic): Performs pragmatic email format validation for user input.
* [`app/ensure-array`](blocks/app/ensure-array): Normalizes any input into an array form.
* [`app/ensure-boolean`](blocks/app/ensure-boolean): Parses booleans from native values and common string forms.
* [`app/ensure-date`](blocks/app/ensure-date): Normalizes date-like input into a valid Date instance or null.
* [`app/ensure-number`](blocks/app/ensure-number): Converts numeric-like input into finite numbers with fallback.
* [`app/ensure-object`](blocks/app/ensure-object): Returns a plain object fallback when input is not an object.
* [`app/ensure-string`](blocks/app/ensure-string): Converts input to string with fallback for nullish values.
* [`app/finite-number`](blocks/app/finite-number): Validates numeric finite values.
* [`app/format-bytes`](blocks/app/format-bytes): Formats byte counts into readable units.
* [`app/format-duration`](blocks/app/format-duration): Formats milliseconds into compact human-readable duration.
* [`app/group-by`](blocks/app/group-by): Groups array items by a key selector.
* [`app/headers-normalize`](blocks/app/headers-normalize): Normalizes HTTP headers into lowercase key map.
* [`app/http-error`](blocks/app/http-error): Structured HTTP error type with status and machine-readable code.
* [`app/idempotency-key`](blocks/app/idempotency-key): Generates deterministic idempotency keys from operation data.
* [`app/iso-date`](blocks/app/iso-date): Checks whether a string is a strict ISO-8601 timestamp.
* [`app/key-by`](blocks/app/key-by): Indexes array items by unique key selector.
* [`app/log-context`](blocks/app/log-context): Builds immutable structured log context with chained key merges.
* [`app/map-keys`](blocks/app/map-keys): Maps object keys while preserving values.
* [`app/map-values`](blocks/app/map-values): Maps object values while preserving keys.
* [`app/non-empty-string`](blocks/app/non-empty-string): Validates that input is a non-empty trimmed string.
* [`app/omit-undefined`](blocks/app/omit-undefined): Alias-like helper that strips undefined fields recursively from plain objects.
* [`app/once-async`](blocks/app/once-async): Wraps an async function so only the first invocation executes.
* [`app/parse-bytes`](blocks/app/parse-bytes): Parses human byte strings like "10MB" into numeric bytes.
* [`app/parse-duration`](blocks/app/parse-duration): Parses durations like "2h 30m" into milliseconds.
* [`app/partition`](blocks/app/partition): Splits array into [pass, fail] based on predicate.
* [`app/pick-defined`](blocks/app/pick-defined): Creates object copy containing only keys with non-undefined values.
* [`app/query-params`](blocks/app/query-params): Builds and parses URL query strings with repeated key support.
* [`app/redact-secrets`](blocks/app/redact-secrets): Redacts sensitive token-like fields from objects and strings.
* [`app/retry-after`](blocks/app/retry-after): Parses Retry-After header values into milliseconds.
* [`app/retry-jitter`](blocks/app/retry-jitter): Retries async operations with exponential backoff and jitter.
* [`app/safe-get`](blocks/app/safe-get): Safely reads a nested property from an object using dot/bracket-like path segments.
* [`app/safe-json-response`](blocks/app/safe-json-response): Reads Response-like JSON with typed fallback on parse failures.
* [`app/safe-set`](blocks/app/safe-set): Sets a nested property safely, creating intermediate objects when needed.
* [`app/sort-by`](blocks/app/sort-by): Sorts array copy by selector value in ascending order.
* [`app/strip-html`](blocks/app/strip-html): Strips HTML tags from text for plain-text rendering.
* [`app/to-camel-case`](blocks/app/to-camel-case): Converts text into camelCase.
* [`app/to-kebab-case`](blocks/app/to-kebab-case): Converts text into kebab-case.
* [`app/to-snake-case`](blocks/app/to-snake-case): Converts text into snake_case.
* [`app/trim-indent`](blocks/app/trim-indent): Trims common leading indentation from multiline strings.
* [`app/truncate-middle`](blocks/app/truncate-middle): Truncates long strings by preserving both head and tail segments.
* [`app/unique-by`](blocks/app/unique-by): Returns unique items by a key selector, keeping first occurrence.
* [`app/with-timeout`](blocks/app/with-timeout): Wraps a promise with timeout rejection.

### 4. Asynchronous & Concurrency
* [`async/cron-scheduler`](blocks/async/cron-scheduler): Asynchronous task scheduler that executes callbacks on recursive timeouts mapped from parsed cron intervals.
* [`async/event-emitter`](blocks/async/event-emitter): A fully-featured typed event emitter supporting standard register, emit, once, and listener management.
* [`async/observable`](blocks/async/observable): Minimal reactive Observable implementation with subscribe, map, filter, take, merge, and static factory methods.
* [`async/promise-pool`](blocks/async/promise-pool): Executes async tasks over an array of items with a configurable concurrency limit, preserving input order.
* [`async/rate-limiter`](blocks/async/rate-limiter): Rate limits async function calls using a token bucket algorithm with sliding window support.
* [`async/semaphore`](blocks/async/semaphore): Concurrency limiter (Semaphore) to throttle parallel async tasks execution.
* [`async/task-queue`](blocks/async/task-queue): Async task queue with concurrency control, priority ordering, pause/resume, and completion callbacks.
* [`async/timeout-promise`](blocks/async/timeout-promise): Promise utilities for timeouts, sleep, retry with backoff, settled-with-timeout, and first-fulfilled race.

### 5. Compiler & Parsing Primitives
* [`compiler/ast-walker`](blocks/compiler/ast-walker): An AST traversal utility applying the Visitor pattern to clean walk node structures recursively.
* [`compiler/bf-compiler`](blocks/compiler/bf-compiler): Brainfuck compiler and virtual machine execution environment featuring jump-map precomputation and custom input stream processing.
* [`compiler/json-schema-validator`](blocks/compiler/json-schema-validator): JSON Schema (Draft-07 matching) validation compiler validating object types, min/max limits, regex patterns, enum arrays, required properties, items lists, anyOf, allOf, oneOf, and not specifications.
* [`compiler/lexer-generator`](blocks/compiler/lexer-generator): Generates a dynamic lexical analyzer/tokenizer matching input streams against a defined set of token rules and regular expressions.
* [`compiler/parser-generator`](blocks/compiler/parser-generator): LL(1) parse table generator from context-free grammar specifications.
* [`compiler/regex-engine`](blocks/compiler/regex-engine): A zero-dependency Regular Expression parser and compiler engine in pure JavaScript. Translates patterns into Abstract Syntax Trees, compiles them to Thompson Nondeterministic Finite Automata (NFA), and executes input matching.
* [`compiler/sql-query-parser`](blocks/compiler/sql-query-parser): SQL lexical scanner and query parser translating SELECT strings (fields, JOINs, WHERE logic, ORDER BY, LIMIT) into structured Abstract Syntax Trees.

### 6. Cryptography & Security
* [`crypto/aes`](blocks/crypto/aes): Symmetrical encryption and decryption (AES-256-GCM) utilizing native Web Crypto API. Fully cross-platform.
* [`crypto/bcrypt-lite`](blocks/crypto/bcrypt-lite): Blowfish-based password key-derivation / hashing system mimicking bcrypt functionality.
* [`crypto/chacha20`](blocks/crypto/chacha20): Pure JavaScript implementation of the ChaCha20 symmetric stream cipher (IETF RFC 7539 format) for high-performance encryption and decryption.
* [`crypto/diffie-hellman`](blocks/crypto/diffie-hellman): Diffie-Hellman Key Exchange algorithm implementation using BigInt modular exponentiation and standard/custom prime groups.
* [`crypto/hash`](blocks/crypto/hash): Cryptographic hashing (SHA-256) and password verification helper (PBKDF2) using native Web Crypto API.
* [`crypto/hmac`](blocks/crypto/hmac): Hash-based Message Authentication Code builder utilizing custom hash engines and cryptographic primitives.
* [`crypto/jwt-helper`](blocks/crypto/jwt-helper): Lightweight token signing and verification helper using standard Web Crypto API. Zero external dependencies.
* [`crypto/pbkdf2`](blocks/crypto/pbkdf2): Password-Based Key Derivation Function 2 (PBKDF2) supporting both synchronous and asynchronous modes with configurable iterations, digest algorithms, and key lengths.
* [`crypto/poly1305`](blocks/crypto/poly1305): Pure JavaScript implementation of the Poly1305 one-time authenticator algorithm utilizing 130-bit BigInt finite field arithmetic.
* [`crypto/rc4`](blocks/crypto/rc4): RC4 stream cipher implementing the Key-Scheduling Algorithm (KSA) and Pseudo-Random Generation Algorithm (PRGA) for encryption and decryption.
* [`crypto/rsa-light`](blocks/crypto/rsa-light): Simple RSA cryptographic key pair generator, encrypt/decrypt and message signer helper using basic BigInt modular arithmetic.
* [`crypto/scrypt`](blocks/crypto/scrypt): Memory-hard password key-derivation function based on scrypt, preventing custom hardware attacks.
* [`crypto/sha3`](blocks/crypto/sha3): Cryptographic Keccak (SHA-3) hashing function implementation.
* [`crypto/totp`](blocks/crypto/totp): Universal Time-based One-Time Password (TOTP) and HMAC-based One-Time Password (HOTP) token generator and validator using standard Web Crypto APIs.
* [`crypto/uuid-shortener`](blocks/crypto/uuid-shortener): UUID compression helper converting standard 36-char UUIDs to short URL-safe Base62 22-char strings and back.

### 7. Database Engine Internals
* [`db/document-db`](blocks/db/document-db): Production-grade, zero-dependency in-memory JSON document database featuring MongoDB-like query parsers, indexing, sorting, projections, and ACID transactions with rollback.
* [`db/graph-db`](blocks/db/graph-db): An in-memory Graph Database featuring labeled nodes, directed property edges, deep traversals (BFS, DFS, Dijkstra), and ACID transactional rollbacks.
* [`db/json-db`](blocks/db/json-db): A transactional, file-backed JSON database supporting basic CRUD operations and concurrency safety.
* [`db/key-value`](blocks/db/key-value): In-memory Key-Value storage engine featuring automated TTL key expirations, event-driven callbacks, and custom persistence adapter hooks.
* [`db/lsm-tree`](blocks/db/lsm-tree): Log-Structured Merge-tree (LSM-Tree) storage engine structure featuring MemTable, flushed Sorted String Tables (SSTables), tombstones, and compaction.
* [`db/migration-engine`](blocks/db/migration-engine): Lightweight versioned schema migration runner that tracks applied database state migrations and supports up/down runs.
* [`db/page-cache`](blocks/db/page-cache): Least Recently Used (LRU) page cache manager simulating dirty page flushing, page storage adapters, and block-based disk operations.
* [`db/relational-db`](blocks/db/relational-db): A comprehensive SQL database engine implemented in pure JavaScript, featuring a SQL lexer/parser, table schema validations (PRIMARY KEY, UNIQUE, NOT NULL), query executors, joins, B-Tree index caches, and ACID transaction journals.
* [`db/resp-parser`](blocks/db/resp-parser): Redis Serialization Protocol (RESP v2) parser and encoder supporting integers, simple strings, bulk strings, errors, and arrays.
* [`db/sql-builder`](blocks/db/sql-builder): SQL query builder offering chainable SELECT, JOIN, WHERE (with safe string value escaping), INSERT, UPDATE, and DELETE query constructions.
* [`db/timeseries-db`](blocks/db/timeseries-db): An in-memory Time-Series Database featuring metric point ingestion, TTL retention policies, tumbling/sliding time window aggregations, downsampling, and stream alerting thresholds.
* [`db/vector-db`](blocks/db/vector-db): An in-memory Vector Database supporting cosine similarity, Euclidean distance searches, metadata filter predicates, and K-Nearest Neighbor (K-NN) query calculations.
* [`db/wal`](blocks/db/wal): Write-Ahead Log (WAL) manager supporting append-only logging, recovery replay, and log clearing to ensure data durability.

### 8. Data Structures
* [`ds/avl-tree`](blocks/ds/avl-tree): A self-balancing binary search tree supporting guaranteed logarithmic inserts, deletes, and lookups via tree rotations.
* [`ds/b-tree`](blocks/ds/b-tree): Balanced search tree optimized for database indexing, supporting multi-way branching, search, and insertion keys splitting.
* [`ds/binary-search-tree`](blocks/ds/binary-search-tree): Standard Binary Search Tree (BST) class supporting node insertions, searches, deletions, and traversal checks.
* [`ds/bloom-filter`](blocks/ds/bloom-filter): A space-efficient probabilistic Bloom Filter membership tester.
* [`ds/circular-buffer`](blocks/ds/circular-buffer): Fixed-size circular ring buffer queue supporting FIFO operations and auto-overwriting on capacity limit.
* [`ds/consistent-hash`](blocks/ds/consistent-hash): Consistent Hashing ring layout helper allowing distribution of keys across dynamic servers nodes with minimal re-mapping.
* [`ds/count-min-sketch`](blocks/ds/count-min-sketch): A probabilistic sub-linear space frequency table estimator structure matching streams of items.
* [`ds/cuckoo-filter`](blocks/ds/cuckoo-filter): A space-efficient probabilistic set membership filter supporting adding, testing, and deleting elements.
* [`ds/deque`](blocks/ds/deque): Double-ended queue with O(1) push and pop at both ends implemented via a doubly linked list.
* [`ds/fenwick-tree`](blocks/ds/fenwick-tree): Binary Indexed Tree (BIT) supporting O(log N) prefix sum queries and point updates on an array.
* [`ds/graph-network`](blocks/ds/graph-network): An advanced graph network library. Supports directed/undirected representations, shortest path solvers using Dijkstra and A* search, Minimum Spanning Trees (MST) via Kruskal's algorithm (using inline Disjoint Set Union), and Tarjan's Strongly Connected Components (SCC) algorithm.
* [`ds/hyperloglog`](blocks/ds/hyperloglog): A space-efficient probabilistic data structure for estimating the cardinality (number of distinct elements) of large datasets.
* [`ds/interval-tree`](blocks/ds/interval-tree): Augmented BST that stores intervals and supports efficient overlap and point-stab queries.
* [`ds/kd-tree`](blocks/ds/kd-tree): A K-Dimensional Tree for spatial partitioning and fast multi-dimensional nearest neighbor search.
* [`ds/lru-cache`](blocks/ds/lru-cache): Least-Recently-Used (LRU) Cache supporting maximum capacity limit eviction and Time-To-Live expiration.
* [`ds/min-max-heap`](blocks/ds/min-max-heap): Double-ended priority queue (Min-Max Heap) supporting retrieval and deletion of both minimum and maximum values in O(log N) time.
* [`ds/octree`](blocks/ds/octree): 3D spatial partitioning tree structure for indexing 3D points, supporting insert, range search (within a bounding box), and nearest neighbor search.
* [`ds/priority-queue`](blocks/ds/priority-queue): Binary heap-based Priority Queue supporting customizable sorting comparators.
* [`ds/quadtree`](blocks/ds/quadtree): A 2D spatial partitioning structure used to index points and perform fast regional range queries.
* [`ds/red-black-tree`](blocks/ds/red-black-tree): Self-balancing binary search tree implementing insertion, deletion, and rotation operations while maintaining node color invariants.
* [`ds/rope`](blocks/ds/rope): Binary-tree rope structure for O(log N) concatenation, split, and character access on large immutable strings.
* [`ds/skip-list`](blocks/ds/skip-list): Probabilistic ordered linked list providing O(log N) average-case search, insert, and delete without tree rotations.
* [`ds/sparse-table`](blocks/ds/sparse-table): Static range minimum/maximum query structure with O(N log N) build time and O(1) query time.
* [`ds/splay-tree`](blocks/ds/splay-tree): Self-adjusting binary search tree where recently accessed elements are splayed to the root, optimizing access speed.
* [`ds/treap`](blocks/ds/treap): A randomized self-balancing binary search tree combining binary search tree properties with heap priorities, supporting insert, delete, search, and split/join operations.
* [`ds/trie`](blocks/ds/trie): Trie (prefix tree) structure optimized for string lookup, autocompletion, and prefix checks.
* [`ds/union-find`](blocks/ds/union-find): A Disjoint Set Union (DSU) / Union-Find data structure with path compression and union by rank. Efficiently tracks which elements belong to the same partition, merges partitions, and checks connectivity. Used in Kruskal's MST, cycle detection, and dynamic graph connectivity.

### 9. Compression & Encodings
* [`encoding/base64`](blocks/encoding/base64): Self-contained Base64 binary and text string encoder/decoder without environment dependencies (works in Node & browser).
* [`encoding/bencode`](blocks/encoding/bencode): Bencoding serialization and deserialization utility supporting integers, strings, lists, and sorted key dictionaries.
* [`encoding/binary-codec`](blocks/encoding/binary-codec): Binary data encoding/decoding utilities for converting numbers and buffers to binary strings, hex strings, and big/little-endian byte arrays.
* [`encoding/hex`](blocks/encoding/hex): High-performance hexadecimal encoding and decoding utility for string and byte representations.
* [`encoding/json-patch`](blocks/encoding/json-patch): RFC 6902 JSON Patch implementation supporting apply, diff generation, and patch validation for add, remove, replace, copy, move, and test operations.
* [`encoding/msgpack`](blocks/encoding/msgpack): Pure JS MessagePack (msgpack) binary serialization encoder and decoder. Highly optimized and zero-dependency.
* [`encoding/protobuf-decoder`](blocks/encoding/protobuf-decoder): Schema-less Protocol Buffers binary stream introspector / decoder, recursively resolving nested fields and wire types (0, 1, 2, 5).
* [`encoding/run-length`](blocks/encoding/run-length): Run-length encoding (RLE) for compressing repetitive sequences in strings and arrays, with string-specific convenience functions.
* [`encoding/tar-archiver`](blocks/encoding/tar-archiver): A cross-runtime POSIX ustar tar archiver and extractor. Encodes files with metadata (name, mode, uid, gid, mtime, size) into raw binary 512-byte aligned tar archive payloads, computes standard octal checksums, and parses tar archives back into file record structures.
* [`encoding/url-codec`](blocks/encoding/url-codec): Dynamic URL query parameters serializer and deserializer helper with nested array/object parsing.
* [`encoding/utf8-validator`](blocks/encoding/utf8-validator): Checks raw byte buffers for well-formed UTF-8 byte sequences according to standard encoding structures.
* [`encoding/varint`](blocks/encoding/varint): Variable-length integer representation (Varint) utilizing MSB continuation flags to serialize and deserialize BigInt numbers efficiently.

### 10. Mathematics & Calculations
* [`math/bezier`](blocks/math/bezier): Bezier curve coordinate generator supporting quadratic, cubic, and arbitrary-degree De Casteljau algorithms for 2D spatial interpolation.
* [`math/bigint-fraction`](blocks/math/bigint-fraction): Arbitrary-precision rational fraction solver utilizing BigInt, supporting canonical reduction, arithmetic, comparisons, and float conversion.
* [`math/bit-ops`](blocks/math/bit-ops): Bit manipulation utilities including power-of-two checks, population count, bit set/clear/toggle/get, bit reversal, and Gray code encoding/decoding.
* [`math/combinatorics`](blocks/math/combinatorics): Combinatorial math utilities including factorial, binomial coefficients, permutations, combinations, Cartesian product, and power set generation.
* [`math/complex`](blocks/math/complex): A complete complex number arithmetic library. Provides a Complex class with operations: add, subtract, multiply, divide, modulus (abs), argument (angle), conjugate, power (integer and complex), square root, exponential, natural log, and trigonometric functions (sin, cos, tan) all working on complex numbers.
* [`math/fft`](blocks/math/fft): Radix-2 Cooley-Tukey Fast Fourier Transform (FFT) and Inverse FFT (IFFT) algorithm for numerical frequency domain transformations.
* [`math/fraction`](blocks/math/fraction): Exact fraction arithmetic with automatic simplification using GCD, supporting add, subtract, multiply, divide, comparison, and decimal conversion.
* [`math/geometry-2d`](blocks/math/geometry-2d): Intersection and distance calculators for 2D vectors, lines, circles, boxes, and polygons.
* [`math/interpolation`](blocks/math/interpolation): Numerical interpolation methods including linear (lerp), bilinear, Lagrange polynomial, and natural cubic spline interpolation.
* [`math/linear-equations`](blocks/math/linear-equations): Linear systems solver using Gaussian Elimination with partial pivoting to compute unique solutions for NxN equations matrices.
* [`math/matrix`](blocks/math/matrix): Matrix mathematics helper supporting transposition, multiplication, determinant, and inversion arithmetic.
* [`math/numerical-integration`](blocks/math/numerical-integration): Definite integrals solver supporting both the Trapezoidal rule and Simpson's 1/3 rule for arbitrary mathematical functions.
* [`math/polynomial`](blocks/math/polynomial): Polynomial arithmetic class supporting addition, subtraction, multiplication, evaluation via Horner's method, symbolic differentiation, and string representation.
* [`math/prime-generator`](blocks/math/prime-generator): A fast prime number toolkit. Generates primes up to N using the Sieve of Eratosthenes, generates the next prime after a given number, performs primality testing with Miller-Rabin (deterministic for small numbers, probabilistic for large), and factorizes integers into prime factors.
* [`math/quaternion`](blocks/math/quaternion): Quaternion mathematics for representing 3D spatial rotations. Supports addition, multiplication, scaling, conjugate, inverse, normalization, and conversion to/from Euler angles and rotation matrices.
* [`math/random`](blocks/math/random): Random helper utility supporting range integers, item choice arrays, weighted choices, and UUID v4 string generation.
* [`math/signal-filter`](blocks/math/signal-filter): Digital signal filters including lowpass, highpass, bandpass, and bandstop Butterworth (IIR) filters, Exponential Moving Average (EMA), and Moving Average filters.
* [`math/statistics-advanced`](blocks/math/statistics-advanced): Implements advanced statistical analyses including ANOVA (Analysis of Variance) and t-tests for hypothesis testing.
* [`math/stats`](blocks/math/stats): Statistics math helper supporting mean, median, mode, variance, standard deviation, and percentile calculations.
* [`math/symbolic-diff`](blocks/math/symbolic-diff): A symbolic differentiation engine. Parses mathematical expression strings into Abstract Syntax Trees (AST), computes exact derivative expressions using differentiation rules (power, product, quotient, chain, and trigonometric rules), simplifies the resulting ASTs, and formats them back to standard expression strings.
* [`math/vector2d`](blocks/math/vector2d): A comprehensive 2D mathematical vector physics and geometry class.

### 11. Media
* [`media/bmp-encoder`](blocks/media/bmp-encoder): Encodes raw RGB pixel buffers into standard uncompressed 24-bit BMP image byte buffers.
* [`media/gif-metadata`](blocks/media/gif-metadata): Parses Logical Screen Descriptor (width, height, background color index), Global Color Table metadata, and image frames descriptor / delay times from GIF binary buffers.
* [`media/mp3-id3-parser`](blocks/media/mp3-id3-parser): Extracts ID3v1 and ID3v2 tags (title, artist, album, year, genre) from MP3 binary buffers.
* [`media/png-metadata`](blocks/media/png-metadata): Extracts size, dimensions, bit depth, color type, compression method, filter method, interlace method, and text annotations (tEXt) from PNG binary buffers.
* [`media/wav-decoder`](blocks/media/wav-decoder): Reads and decodes RIFF/WAV audio metadata and raw sample data from binary byte buffers into normalized Float32 arrays.

### 12. Machine Learning Primitives
* [`ml/cosine-similarity`](blocks/ml/cosine-similarity): Calculates the cosine similarity, cosine distance, and pairwise similarities between high-dimensional vector embeddings.
* [`ml/dbscan`](blocks/ml/dbscan): Density-Based Spatial Clustering of Applications with Noise (DBSCAN) algorithm for clustering multi-dimensional data points and identifying noise.
* [`ml/decision-tree`](blocks/ml/decision-tree): A zero-dependency Decision Tree Classifier and Regressor engine in pure JavaScript. Calculates split nodes recursively using Gini Impurity, entropy, or variance reduction, and supports max depth, min samples split constraints, and feature importance scores.
* [`ml/knn`](blocks/ml/knn): K-Nearest Neighbors classifier and regressor supporting Euclidean, Manhattan, and Chebyshev distance metrics.
* [`ml/linear-regression`](blocks/ml/linear-regression): Performs univariate or multivariate Linear Regression trained using standard Gradient Descent.
* [`ml/logistic-regression`](blocks/ml/logistic-regression): Performs binary classification using Logistic Regression optimized with Gradient Descent.
* [`ml/naive-bayes`](blocks/ml/naive-bayes): A Multinomial Naive Bayes classifier primarily used for text classification and bag-of-words document grouping.
* [`ml/neural-network`](blocks/ml/neural-network): A zero-dependency deep learning / backpropagation neural network engine in pure JavaScript. Supports arbitrary layers, dense layers, diverse activations (ReLU, Sigmoid, Tanh, Softmax), optimizers (SGD, Adam), and standard losses (MSE, Cross-entropy).
* [`ml/pca`](blocks/ml/pca): Principal Component Analysis (PCA) utility for feature reduction and data projections.
* [`ml/perceptron`](blocks/ml/perceptron): Single-layer binary classifier neural unit that trains weights using a learning rate and updates inputs linearly.
* [`ml/random-forest`](blocks/ml/random-forest): Random Forest Ensemble Classifier and Regressor built using bootstrapped Decision Trees and random feature selection.
* [`ml/svm`](blocks/ml/svm): Support Vector Machine (SVM) binary classifier using linear kernels and simple gradient updates.
* [`ml/tf-idf`](blocks/ml/tf-idf): Term Frequency-Inverse Document Frequency (TF-IDF) document text vectorizer/encoder with built-in tokenization and L2 normalization options.

### 13. Observability
* [`observability/error-aggregator`](blocks/observability/error-aggregator): Fingerprint, group, and deduplicate application errors. Tracks occurrence statistics, timelines, and metadata context.
* [`observability/health-check`](blocks/observability/health-check): HTTP health/readiness/liveness checker with support for concurrent checks, timeouts, and standard HTTP server handlers.
* [`observability/log-formatter`](blocks/observability/log-formatter): Structured JSON log formatter featuring customizable levels, correlation ID tracing, and deep object redaction of sensitive key/value pairs.
* [`observability/metrics-registry`](blocks/observability/metrics-registry): In-process metrics registry supporting Counters, Gauges, and Histograms with Prometheus exposition text format export.
* [`observability/perf-profiler`](blocks/observability/perf-profiler): High-resolution hierarchical performance profiler with flamegraph-compatible text export formats.
* [`observability/span-tracer`](blocks/observability/span-tracer): Lightweight distributed tracing: spans, parent-child hierarchy, and W3C traceparent headers.

### 14. Network Protocols
* [`protocol/coap-parser`](blocks/protocol/coap-parser): A zero-dependency RFC 7252 CoAP (Constrained Application Protocol) packet parser and formatter. Supports message types (CON, NON, ACK, RST), token parsing, delta-encoded option processing (e.g. Uri-Path, Uri-Query, Content-Format), option delta extensions, and payload serialization.
* [`protocol/dns-resolver`](blocks/protocol/dns-resolver): A zero-dependency DNS client and resolver built from scratch in Node.js. Packs binary DNS query structures (Headers, Question flags, label-length domain encoding) and decodes DNS response packets (decoding headers, question echoes, records A, AAAA, CNAME, MX, TXT, and domain name compression pointers) using UDP sockets.
* [`protocol/grpc-encoder`](blocks/protocol/grpc-encoder): A zero-dependency gRPC length-prefixed framing serializer and deserializer. Formats messages into the gRPC protocol wire format (1-byte compressed flag, 4-byte big-endian length, and body), and parses incoming frames back into messages.
* [`protocol/mqtt-client`](blocks/protocol/mqtt-client): A zero-dependency, lightweight MQTT v3.1.1 packet parser and serializer. Supports CONNECT, CONNACK, PUBLISH, PUBACK, SUBSCRIBE, and SUBACK packets.
* [`protocol/websocket-frame`](blocks/protocol/websocket-frame): A zero-dependency RFC 6455 WebSocket frame serializer and parser. Handles FIN, RSV bits, opcodes (text, binary, ping, pong, close), masking/unmasking, and variable length payload decoding (7-bit, 16-bit, and 64-bit lengths).

### 15. Security
* [`security/api-key-manager`](blocks/security/api-key-manager): Secure API key generation, hashing, rotation, and revocation management.
* [`security/audit-logger`](blocks/security/audit-logger): Tamper-evident append-only audit log with HMAC chain integrity.
* [`security/csp-builder`](blocks/security/csp-builder): Content Security Policy (CSP) header builder and security validator.
* [`security/permission-engine`](blocks/security/permission-engine): RBAC/ABAC permission evaluator with role hierarchies.
* [`security/sanitizer`](blocks/security/sanitizer): DOM/HTML input sanitizer (allowlist-based, XSS-proof).
* [`security/secret-manager`](blocks/security/secret-manager): Encrypted in-memory secrets store with TTL expiry and audit log support.

### 16. State Management
* [`state/atom`](blocks/state/atom): Jotai-style atomic state primitives with get, set, subscribe, derive, reset, and peek — composable independent units of reactive state.
* [`state/command-pattern`](blocks/state/command-pattern): Command pattern implementation with an undo/redo history stack for executing, reversing, and replaying discrete operations.
* [`state/fsm`](blocks/state/fsm): A Finite State Machine (FSM) manager featuring state transitions, guards, side-effect actions, and subscription events.
* [`state/history-manager`](blocks/state/history-manager): Browser-history-like navigation stack for SPAs — push, replace, and navigate entries with listener notifications, mirroring the History API semantics.
* [`state/observable-store`](blocks/state/observable-store): Observable key-value state store with per-key change subscriptions, batched transactions, and JSON serialization — a lightweight MobX-style reactive store.
* [`state/redux-lite`](blocks/state/redux-lite): A lightweight global state store with actions dispatcher, state reducers, subscription listeners, and custom middleware support.
* [`state/signal`](blocks/state/signal): Fine-grained reactive signals inspired by SolidJS — signal(), computed(), and effect() primitives with automatic dependency tracking.

### 17. Stream Processing
* [`stream/batch-processor`](blocks/stream/batch-processor): Batches streaming data based on item count, size, or time duration before downstream processing.
* [`stream/csv-streamer`](blocks/stream/csv-streamer): High-performance, zero-dependency streaming CSV parser and stringifier supporting custom delimiters, escaping, and headers mapping.
* [`stream/deduplicator`](blocks/stream/deduplicator): State-tracking stream deduplicator that filters out duplicate records based on a unique key, hash, or sliding window time cache.
* [`stream/json-streamer`](blocks/stream/json-streamer): Streaming JSON parser for large arrays or newline-delimited JSON (NDJSON) payloads, emitting objects as they are parsed without loading the whole file into memory.
* [`stream/pipeline`](blocks/stream/pipeline): A stream pipeline orchestrator that chains multiple async generators, transform streams, or readable/writable streams together with error handling, data flow controls, and performance statistics.
* [`stream/schema-mapper`](blocks/stream/schema-mapper): Transforms and validates streaming records against a schema with data mapping rules, default value injection, and type coercion.
* [`stream/windowed-aggregator`](blocks/stream/windowed-aggregator): Aggregates streaming data in real-time using tumbling, sliding, or session windows, computing metrics like count, sum, average, min, max, or custom metrics.

### 18. System Utilities
* [`sys/cli-builder`](blocks/sys/cli-builder): Declarative command line interface builder supporting subcommands, custom flags, descriptions, and automatic help generation.
* [`sys/config-loader`](blocks/sys/config-loader): Flexible configuration loader that deep-merges defaults with JSON files, environment variables, and CLI arguments.
* [`sys/env-parser`](blocks/sys/env-parser): Parses .env configuration files, supporting single/double quotes, comments, escapes, and multiline variables.
* [`sys/file-watcher`](blocks/sys/file-watcher): Cross-platform file and directory change watcher supporting both native FS events and polling fallback.
* [`sys/path-resolver`](blocks/sys/path-resolver): Cross-platform path normalization, resolution, and joining utility for resolving relative and absolute paths.
* [`sys/plugin-loader`](blocks/sys/plugin-loader): Dynamic plugin manager supporting topological dependency sorting, lifecycle hook execution, and automatic directory-based plugin discovery.
* [`sys/process-monitor`](blocks/sys/process-monitor): Wraps child process execution with status monitoring, safety limits, and collects resource usage samples (CPU/memory) for processes.
* [`sys/terminal-ansi`](blocks/sys/terminal-ansi): ANSI escape code utility for styling terminal text output (colors, backgrounds, styles) and stripping styles.

### 19. Text Processing & Formatter
* [`text/bbcode-parser`](blocks/text/bbcode-parser): BBCode to HTML parser and AST compiler (handles standard tags like [b], [i], [url]).
* [`text/csv-parser`](blocks/text/csv-parser): Robust CSV parser and generator correctly handling quoted escape strings and delimiters.
* [`text/diff-match`](blocks/text/diff-match): Text line comparison engine computing difference deltas using Longest Common Subsequence (LCS).
* [`text/html-parser`](blocks/text/html-parser): Lightweight HTML string to AST parser that handles standard tags, self-closing tags, attributes, and text nodes.
* [`text/ini-parser`](blocks/text/ini-parser): A parser and serializer for INI configuration file format. Parses sections ([section]), key-value pairs, comments (# and ;), inline comments, multi-value keys, and quoted string values. Serializes JavaScript objects back into INI format.
* [`text/json-serializer`](blocks/text/json-serializer): Safe JSON parser and stringifier handling circular references, BigInts, and parsing fallback recoveries.
* [`text/json5-parser`](blocks/text/json5-parser): A complete JSON5 parser and serializer. Parses JSON5 superset strings supporting single-quoted strings, unquoted keys, trailing commas, block and line comments, hexadecimal literals, Infinity, NaN, and multiline strings. Serializes values back to valid JSON5 format.
* [`text/markdown-compiler`](blocks/text/markdown-compiler): An AST-based Markdown compiler that parses markdown syntax into an Abstract Syntax Tree (AST) and renders it to sanitized HTML.
* [`text/markdown-table`](blocks/text/markdown-table): Formatter that translates arrays of objects or rows into clean markdown table layouts.
* [`text/parser-combinator`](blocks/text/parser-combinator): A monadic parser combinator framework to build custom compilers, lexers, and syntax parsers with full source coordinate (line, column) error tracking.
* [`text/tokenizer`](blocks/text/tokenizer): Simple whitespace and punctuation tokenizer producing clean token arrays, with support for word tokenization, sentence splitting, and n-gram generation.
* [`text/word-wrap`](blocks/text/word-wrap): Intelligent text wrapping with configurable width, indentation, hard-cut mode, newline preservation, plus word-wrap and center-text utilities.
* [`text/xml-parser`](blocks/text/xml-parser): Lightweight, zero-dependency XML-to-JSON parser that parses XML strings into nested JavaScript object trees.
* [`text/yaml-parser`](blocks/text/yaml-parser): A lightweight YAML 1.2 subset parser supporting scalar strings, booleans, integers, floats, null, multiline strings (literal | and folded >), nested mappings (objects), sequences (arrays), and inline flow syntax. Serializes JavaScript values back to YAML format.

### 20. UI & Layout Mechanics
* [`ui/canvas-charts`](blocks/ui/canvas-charts): Programmatic bar, line, and pie chart renderer for HTML Canvas element context based on input options (data, dimensions, colors, labels).
* [`ui/color-converter`](blocks/ui/color-converter): Color parsing and format space converter (HEX, RGB, HSL) with W3C relative luminance contrast ratio compliance calculations.
* [`ui/css-parser`](blocks/ui/css-parser): Lightweight CSS parser that parses style sheets into structured rule and declaration objects.
* [`ui/query-builder`](blocks/ui/query-builder): Safe SQL query string building helper utilizing template placeholders for bind values.
* [`ui/spring-physics`](blocks/ui/spring-physics): A simple mass-spring-damper physics animation tick utility supporting target destination, stiffness, damping, mass, and velocity.
* [`ui/svg-generator`](blocks/ui/svg-generator): Programmatically constructs SVG shapes (rect, circle, line, polygon, path) and attributes, and exports to SVG XML string format.
* [`ui/virtual-dom`](blocks/ui/virtual-dom): A lightweight Virtual DOM and reconciliation engine in pure JavaScript. Features virtual node creation (h/createElement), tree diffing & patch reconciliation, functional components with state and effect hooks (useState, useEffect), and server-side rendering (SSR) to HTML.

### 21. Utility Helper Functions
* [`utils/chunk`](blocks/utils/chunk): Splits arrays into chunks of a given size, or groups elements by a predicate function.
* [`utils/date-formatter`](blocks/utils/date-formatter): Date arithmetic and token formatting helper (format, addTime, isBetween) without external libraries.
* [`utils/debounce`](blocks/utils/debounce): Creates a debounced version of a function to delay invocation until after wait milliseconds.
* [`utils/deep-clone`](blocks/utils/deep-clone): Performs a deep, structural clone of JavaScript values including nested objects, arrays, Maps, Sets, Dates, RegExp, ArrayBuffers, TypedArrays, and handles circular references gracefully using a WeakMap reference tracker.
* [`utils/deep-merge`](blocks/utils/deep-merge): Deep merges multiple plain objects together, with configurable array merging strategy (concatenate or replace).
* [`utils/dependency-resolver`](blocks/utils/dependency-resolver): Topological dependency sorting utility that resolves dependency order for a list of packages/nodes and detects circular dependency graphs.
* [`utils/flatten`](blocks/utils/flatten): Flattens nested arrays to any depth, with helpers for shallow, deep, and infinite flattening.
* [`utils/memoize`](blocks/utils/memoize): Memoization utility cache decorator caching function results mapped by argument signatures.
* [`utils/object-diff`](blocks/utils/object-diff): Computes a structural diff between two nested JavaScript objects. Returns a patch object describing changes: added keys, removed keys, modified values (with from/to), and nested deep changes. Supports applying patches and computing reverse patches.
* [`utils/once`](blocks/utils/once): Wraps a function so it executes only once, caching the first successful result and exposing reset state controls.
* [`utils/pick-omit`](blocks/utils/pick-omit): Selects or excludes keys from objects using key lists or predicate functions.
* [`utils/pubsub`](blocks/utils/pubsub): A lightweight topic-based Publish-Subscribe (PubSub) message bus. Supports wildcard topic matching (*, **), synchronous and asynchronous delivery, message history replay for late subscribers, one-time subscribers, and unsubscription.
* [`utils/retry`](blocks/utils/retry): A generalized task execution retrier supporting custom delay backoff, jitter, and error conditional triggers.
* [`utils/size-formatter`](blocks/utils/size-formatter): Converts byte counts to human-readable strings (B, KB, MB, GB, TB) and parses them back to byte counts.
* [`utils/slugify`](blocks/utils/slugify): Converts arbitrary strings to URL-safe slugs, handling unicode, special characters, custom separators, and case normalization.
* [`utils/string-utils`](blocks/utils/string-utils): Common string manipulation helpers including case conversion (camelCase, PascalCase, snake_case, kebab-case), truncation, and padding.
* [`utils/template-engine`](blocks/utils/template-engine): Minimal zero-dependency string template engine supporting variable interpolation, conditionals ({{#if}}), and loops ({{#each}}).
* [`utils/throttle`](blocks/utils/throttle): Throttling wrapper to ensure a function runs at most once in a specified time window.
* [`utils/url-builder`](blocks/utils/url-builder): Parameter builder that constructs, validates, and parses nested query strings and URL objects.
* [`utils/uuid-v4`](blocks/utils/uuid-v4): Generates cryptographically random UUID v4 strings (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx format). Works in Node.js, Deno, Bun, and browsers via the Web Crypto API. Also validates UUID format strings and generates short 8-character nanoid-style IDs.

### 22. Validation & Security Guards
* [`validation/credit-card`](blocks/validation/credit-card): Credit card number validation using the Luhn algorithm with card type detection and formatting.
* [`validation/cron-parser`](blocks/validation/cron-parser): Standard 5-field crontab pattern parser to validate schedules and resolve subsequent matching execution timestamps.
* [`validation/date-validator`](blocks/validation/date-validator): Date string validation, range checking, leap year detection, and weekday/weekend classification.
* [`validation/email-rfc5322`](blocks/validation/email-rfc5322): A comprehensive RFC 5321/5322 email address validator. Validates local-part (before @), domain, and sub-domain syntax including quoted strings, IP address literals, international domain names (IDN), and checks for length constraints and prohibited characters.
* [`validation/ip-validator`](blocks/validation/ip-validator): Comprehensive IPv4/IPv6 validator featuring syntax checks, CIDR subnet matching, public vs private routing scopes, loopbacks, and link-local validations.
* [`validation/isbn`](blocks/validation/isbn): ISBN-10 and ISBN-13 validator that handles spaces, dashes, and verifies weighted checksum constraints (including 'X' check character).
* [`validation/json-path`](blocks/validation/json-path): JSONPath expression evaluator supporting dot notation, bracket notation, wildcards, array indices, and recursive descent.
* [`validation/json-sanitizer`](blocks/validation/json-sanitizer): Cleans malformed/relaxed JSON inputs (such as trailing commas, unquoted keys, single quotes, or comments) to construct standard parseable JSON string blocks.
* [`validation/jwt-validator`](blocks/validation/jwt-validator): JWT authentication credentials extraction and verification utility for request headers.
* [`validation/mime-detector`](blocks/validation/mime-detector): Magic bytes file signature MIME type detector resolving common image, audio, document, archive, and text structured formats.
* [`validation/password-strength`](blocks/validation/password-strength): Calculates entropy scoring password complexity based on length, casing, digit matching, symbols, and repeating sequences.
* [`validation/phone-validator`](blocks/validation/phone-validator): International phone number validation, formatting, and extraction supporting E.164 format.
* [`validation/schema-validator`](blocks/validation/schema-validator): A lightweight object schema validation engine (Zod-like syntax) supporting nested properties verification.
* [`validation/semver`](blocks/validation/semver): Semantic Versioning (SemVer 2.0.0) validator, parser, comparator, and range matcher. Parses version strings into { major, minor, patch, prerelease, build } components, compares versions correctly, checks compatibility ranges (^, ~, >=, <, =, ||, -), and sorts version arrays.
* [`validation/sql-injection-detector`](blocks/validation/sql-injection-detector): Static heuristic analysis and signature detection to identify SQL injection patterns (e.g., tautologies, union select, database comments) in user inputs.
* [`validation/url-validator`](blocks/validation/url-validator): Validates URLs with fine-grained options including protocol, TLD, and localhost requirements.
* [`validation/xss-filter`](blocks/validation/xss-filter): An HTML XSS sanitizer that removes dangerous script elements, event handler attributes, javascript: protocol links, and data: URI injections from HTML strings. Supports allowlists for safe tags and attributes. Returns sanitized HTML safe for rendering in the browser.

### 23. Web & Networking Middleware
* [`web/api-client`](blocks/web/api-client): An advanced REST API request builder supporting middleware-like request and response interceptors.
* [`web/cookie-helper`](blocks/web/cookie-helper): Safe browser cookie manipulation helper (set, get, delete) supporting attributes like path, domain, security, and samesite.
* [`web/cors-middleware`](blocks/web/cors-middleware): Rules-based CORS handler managing pre-flight checks, dynamic origin validations, custom headers, and authorization requests.
* [`web/doh-client`](blocks/web/doh-client): A DNS-over-HTTPS (DoH) resolver utility using standard fetch APIs to perform JSON-format DNS queries.
* [`web/doh-server`](blocks/web/doh-server): Lightweight DNS-over-HTTPS (DoH) handler that parses and responds to standard RFC 8484 DNS queries over HTTP.
* [`web/fetch-retry`](blocks/web/fetch-retry): A resilient fetch wrapper supporting retries, delay backoff, and request timeouts.
* [`web/graphql-client`](blocks/web/graphql-client): Zero-dependency, Promise-based GraphQL client utilizing native fetch to execute queries and mutations with variable binding support.
* [`web/http-client-curl`](blocks/web/http-client-curl): HTTP client request decorator wrapper generating corresponding, executable curl command strings.
* [`web/http-client-resilient`](blocks/web/http-client-resilient): Production-grade universal HTTP client featuring built-in Circuit Breaker patterns, caching with TTL, request/response middleware, rate limiting, and exponential retry backoff.
* [`web/http-server`](blocks/web/http-server): A zero-dependency HTTP/1.1 Web Server built from scratch using Node.js TCP sockets. Implements raw request parsing, header and cookie mapping, body buffers, a parameterized routing tree, middleware orchestration, and response formatting helpers.
* [`web/load-balancer`](blocks/web/load-balancer): HTTP load balancer distributing requests across multiple backend servers using Round Robin, Least Connections, and Random routing, including active background health checks.
* [`web/multipart-parser`](blocks/web/multipart-parser): A lightweight parser for decoding multipart/form-data request payloads and extracted file attachments.
* [`web/oauth2-client`](blocks/web/oauth2-client): Universal OAuth 2.0 and OpenID Connect client supporting Authorization Code Flow with PKCE state challenge, token exchange, refresh sequences, and cryptographically secure state verifiers.
* [`web/rate-limiter-token-bucket`](blocks/web/rate-limiter-token-bucket): Token Bucket algorithm rate limiter for web request throttling, supporting custom capacities, refill rates, and multi-token consumption.
* [`web/request-deduper`](blocks/web/request-deduper): Deduplicates concurrent async requests by key and optionally caches results for a short TTL to reduce repeated network/API work.
* [`web/reverse-proxy`](blocks/web/reverse-proxy): Programmatic HTTP reverse proxy that forwards incoming requests to target servers, rewriting headers, preserving HTTP methods, and streaming responses back.
* [`web/router`](blocks/web/router): A client-side routing helper mapping paths to handlers, supporting dynamic param extraction.
* [`web/session-manager`](blocks/web/session-manager): A signed cookie-based session manager validating session states and preventing tampering using HMAC signatures.
* [`web/sse-client`](blocks/web/sse-client): Universal Server-Sent Events (SSE) client built on standard Fetch and Streams API. Supports custom headers, request options, and auto-reconnections.
* [`web/static-server`](blocks/web/static-server): A zero-dependency static file server mapping URLs to directories, managing MIME types, ETag cache validations, and file streams.
* [`web/tcp-client-server`](blocks/web/tcp-client-server): Clean Promise-based wrappers for Node.js raw TCP clients and servers using the native 'net' module, ideal for building custom protocol pipelines.
* [`web/url-template`](blocks/web/url-template): An RFC 6570 Uri Template processor that expands templates using dynamic variables maps.
* [`web/websocket-client`](blocks/web/websocket-client): Resilient WebSocket client supporting heartbeat check, auto-reconnection, and buffered message outbox.

---

## Automated Verification Suite

To guarantee total reliability, the repository includes a custom test harness:

```bash
# Execute unit testing validations on all 36 blocks
node test/run-tests.js
```
All unit tests are executed sequentially with zero regressions, validating boundary tolerances, crash behaviors, and type safety constraints.
