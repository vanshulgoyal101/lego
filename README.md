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

# View detailed parameter documentation and AI instructions
node bin/cli.js view web/fetch-retry

# Copy a block directly into your project's codebase
node bin/cli.js add web/fetch-retry --dest ./src/utils
```

---

## Categorized Block Catalog

We have developed **36 production-grade blocks** organized across 8 categories:

### 1. Cryptography & Security
* [`crypto/aes`](blocks/crypto/aes): Symmetrical encryption and decryption (AES-256-GCM) via Web Crypto API.
* [`crypto/hash`](blocks/crypto/hash): Cryptographic hashing (SHA-256) and secure password verification (PBKDF2).
* [`crypto/jwt-helper`](blocks/crypto/jwt-helper): Token signing and verification helper using HMAC SHA-256.
* [`crypto/uuid-shortener`](blocks/crypto/uuid-shortener): Compress 36-char UUIDs into URL-safe 22-char Base62 strings.

### 2. Validation & Guards
* [`validation/schema-validator`](blocks/validation/schema-validator): Zod-like object schema structure validator.
* [`validation/jwt-validator`](blocks/validation/jwt-validator): HTTP authorization header bearer credentials extraction and verification.
* [`validation/rate-limiter`](blocks/validation/rate-limiter): Sliding-window in-memory rate limiter to protect endpoints.

### 3. Data Structures
* [`ds/priority-queue`](blocks/ds/priority-queue): Binary heap-based Priority Queue.
* [`ds/trie`](blocks/ds/trie): Trie prefix tree for quick string lookup and autocompletion suggestions.
* [`ds/lru-cache`](blocks/ds/lru-cache): Least-Recently-Used cache eviction map with Time-to-Live (TTL).
* [`ds/bloom-filter`](blocks/ds/bloom-filter): Space-efficient probabilistic membership filter.
* [`ds/circular-buffer`](blocks/ds/circular-buffer): Circular ring buffer queue supporting FIFO and auto-overwrites.
* [`ds/binary-search-tree`](blocks/ds/binary-search-tree): BST supporting insertions, deletions, and sorted in-order traversals.

### 4. Algorithms
* [`algo/graph`](blocks/algo/graph): Graph representation supporting BFS, DFS, and Dijkstra pathfinding.
* [`algo/binary-search`](blocks/algo/binary-search): Sorted list element search helper ($O(\log N)$).
* [`algo/sorting`](blocks/algo/sorting): In-place QuickSort and stable MergeSort algorithms.
* [`algo/levenshtein`](blocks/algo/levenshtein): Edit distance calculator measuring string similarity.
* [`algo/luhn`](blocks/algo/luhn): Checksum validation for credit cards and identity numbers.

### 5. Web & Routing
* [`web/fetch-retry`](blocks/web/fetch-retry): Resilient fetch wrapper with timeout and backoff.
* [`web/api-client`](blocks/web/api-client): REST API client with request/response middleware interceptor hooks.
* [`web/websocket-client`](blocks/web/websocket-client): WebSocket client with heartsbeat, reconnection, and outbox buffers.
* [`web/router`](blocks/web/router): Frontend SPA client-side route manager with dynamic parameters parsing.
* [`web/cookie-helper`](blocks/web/cookie-helper): Browser cookie manipulation helper.

### 6. Text & Parsers
* [`text/markdown-parser`](blocks/text/markdown-parser): Lightweight Markdown-to-HTML parser.
* [`text/csv-parser`](blocks/text/csv-parser): Quoting-safe CSV parser and stringifier.
* [`text/json-serializer`](blocks/text/json-serializer): Circular references and BigInt safe JSON stringifier.
* [`text/diff-match`](blocks/text/diff-match): Line-by-line difference comparator delta mapping.

### 7. Performance & Async
* [`async/semaphore`](blocks/async/semaphore): Promise concurrency limiter lock throttle.
* [`async/event-emitter` ](blocks/async/event-emitter): Custom event-driven communication emitter helper.
* [`utils/debounce`](blocks/utils/debounce): Debounce execution limiting function.
* [`utils/throttle`](blocks/utils/throttle): Throttle window execution rate limiter.
* [`utils/memoize`](blocks/utils/memoize): Function call parameters caching decorator.
* [`utils/retry`](blocks/utils/retry): Generalized task retry wrapper with exponential backoff and jitter.

### 8. Math & Formatting
* [`math/vector2d`](blocks/math/vector2d): 2D geometry/physics vector class.
* [`math/matrix`](blocks/math/matrix): Matrix dimensions math calculations (multiplication, determinants).
* [`math/random`](blocks/math/random): UUID v4, range integers, and weighted selection random choices.
* [`math/stats`](blocks/math/stats): Statistics data summaries (mean, median, mode, standard deviation).
* [`ui/color-converter`](blocks/ui/color-converter): HEX/RGB/HSL converters with W3C luminance contrast checkers.
* [`ui/query-builder`](blocks/ui/query-builder): SQL query builder protecting against injections.
* [`utils/date-formatter`](blocks/utils/date-formatter): Token date string formatting and calculations.

---

## Automated Verification Suite

To guarantee total reliability, the repository includes a custom test harness:

```bash
# Execute unit testing validations on all 36 blocks
node test/run-tests.js
```
All unit tests are executed sequentially with zero regressions, validating boundary tolerances, crash behaviors, and type safety constraints.
