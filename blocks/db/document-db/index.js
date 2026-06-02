/**
 * Universal, production-grade, zero-dependency in-memory JSON document database.
 * Supports MongoDB-like nested queries, query execution projections, index maps,
 * cursors sorting/pagination, and transaction ACID rollback.
 */

// Helper to access nested objects using dot notation (e.g., "profile.age")
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

// Deep clone helper for transactional snapshots
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj);
  
  if (Array.isArray(obj)) {
    const arrCopy = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i]);
    }
    return arrCopy;
  }
  
  const copy = {};
  for (const key of Object.keys(obj)) {
    copy[key] = deepClone(obj[key]);
  }
  return copy;
}

// Check deep equality
function deepEquals(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  
  for (const k of keysA) {
    if (!keysB.includes(k) || !deepEquals(a[k], b[k])) return false;
  }
  return true;
}

/**
 * Matches a single document against a query criteria.
 */
export function matchDocument(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key of Object.keys(query)) {
    const val = query[key];

    // Logical Operators
    if (key === '$and') {
      if (!Array.isArray(val)) throw new Error('$and operator requires an array');
      if (!val.every(q => matchDocument(doc, q))) return false;
      continue;
    }
    if (key === '$or') {
      if (!Array.isArray(val)) throw new Error('$or operator requires an array');
      if (!val.some(q => matchDocument(doc, q))) return false;
      continue;
    }
    if (key === '$nor') {
      if (!Array.isArray(val)) throw new Error('$nor operator requires an array');
      if (val.some(q => matchDocument(doc, q))) return false;
      continue;
    }
    if (key === '$not') {
      if (typeof val !== 'object') throw new Error('$not operator requires a query object');
      if (matchDocument(doc, val)) return false;
      continue;
    }

    const docVal = getNestedValue(doc, key);

    // Operator Evaluation
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp)) {
      // Comparison operator checks
      for (const op of Object.keys(val)) {
        const target = val[op];
        switch (op) {
          case '$eq':
            if (!deepEquals(docVal, target)) return false;
            break;
          case '$ne':
            if (deepEquals(docVal, target)) return false;
            break;
          case '$gt':
            if (!(docVal > target)) return false;
            break;
          case '$gte':
            if (!(docVal >= target)) return false;
            break;
          case '$lt':
            if (!(docVal < target)) return false;
            break;
          case '$lte':
            if (!(docVal <= target)) return false;
            break;
          case '$in':
            if (!Array.isArray(target)) throw new Error('$in operator requires an array');
            if (!target.some(item => deepEquals(docVal, item))) return false;
            break;
          case '$nin':
            if (!Array.isArray(target)) throw new Error('$nin operator requires an array');
            if (target.some(item => deepEquals(docVal, item))) return false;
            break;
          case '$regex': {
            const regex = target instanceof RegExp ? target : new RegExp(target, val.$options || '');
            if (typeof docVal !== 'string' || !regex.test(docVal)) return false;
            break;
          }
          case '$options':
            // Ignored, handled by $regex
            break;
          case '$exists':
            const exists = docVal !== undefined;
            if (exists !== !!target) return false;
            break;
          case '$size':
            if (!Array.isArray(docVal) || docVal.length !== target) return false;
            break;
          case '$all':
            if (!Array.isArray(target)) throw new Error('$all operator requires an array');
            if (!Array.isArray(docVal) || !target.every(item => docVal.includes(item))) return false;
            break;
          default:
            throw new Error(`Unsupported query operator: ${op}`);
        }
      }
    } else if (val instanceof RegExp) {
      if (typeof docVal !== 'string' || !val.test(docVal)) return false;
    } else {
      // Direct equality check
      if (!deepEquals(docVal, val)) return false;
    }
  }

  return true;
}

/**
 * Cursor representing query results. Supports sorting, projection, pagination.
 */
export class Cursor {
  constructor(documents, query) {
    this.documents = documents;
    this.query = query;
    this._sortSpec = null;
    this._skipCount = 0;
    this._limitCount = Infinity;
    this._projection = null;
  }

  sort(sortSpec) {
    this._sortSpec = sortSpec;
    return this;
  }

  skip(n) {
    this._skipCount = Math.max(0, n);
    return this;
  }

  limit(n) {
    this._limitCount = Math.max(0, n);
    return this;
  }

  project(projection) {
    this._projection = projection;
    return this;
  }

  toArray() {
    // 1. Filter matching documents
    let results = this.documents.filter(doc => matchDocument(doc, this.query));

    // 2. Sort documents
    if (this._sortSpec) {
      const keys = Object.keys(this._sortSpec);
      results.sort((a, b) => {
        for (const key of keys) {
          const dir = this._sortSpec[key] === -1 ? -1 : 1;
          const valA = getNestedValue(a, key);
          const valB = getNestedValue(b, key);

          if (valA === undefined && valB !== undefined) return -1 * dir;
          if (valA !== undefined && valB === undefined) return 1 * dir;
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
        }
        return 0;
      });
    }

    // 3. Skip & Limit pagination
    if (this._skipCount > 0) {
      results = results.slice(this._skipCount);
    }
    if (this._limitCount < Infinity) {
      results = results.slice(0, this._limitCount);
    }

    // 4. Projections mapping
    if (this._projection) {
      const projKeys = Object.keys(this._projection);
      const isInclusive = projKeys.some(k => this._projection[k] === 1 && k !== '_id');

      results = results.map(doc => {
        const copy = {};
        if (isInclusive) {
          // Only copy designated projection paths
          projKeys.forEach(k => {
            if (this._projection[k] === 1) {
              const v = getNestedValue(doc, k);
              if (v !== undefined) {
                // Handle nested structure assignments
                const parts = k.split('.');
                let cur = copy;
                for (let i = 0; i < parts.length - 1; i++) {
                  cur[parts[i]] = cur[parts[i]] || {};
                  cur = cur[parts[i]];
                }
                cur[parts[parts.length - 1]] = v;
              }
            }
          });
          // Preserve _id unless explicitly excluded
          if (this._projection._id !== 0 && doc._id !== undefined) {
            copy._id = doc._id;
          }
        } else {
          // Copy everything except excluded paths
          const temp = deepClone(doc);
          projKeys.forEach(k => {
            if (this._projection[k] === 0) {
              const parts = k.split('.');
              let cur = temp;
              for (let i = 0; i < parts.length - 1; i++) {
                if (cur) cur = cur[parts[i]];
              }
              if (cur) delete cur[parts[parts.length - 1]];
            }
          });
          Object.assign(copy, temp);
        }
        return copy;
      });
    } else {
      results = results.map(d => deepClone(d));
    }

    return results;
  }
}

/**
 * Collection represents a single document space schema.
 */
export class Collection {
  constructor(name, db) {
    this.name = name;
    this.db = db;
    this.documents = [];
    this.indexes = new Map(); // fieldName -> Map(fieldVal -> Array(docRefs))
    this.autoIncrementId = 1;
  }

  createIndex(fieldName) {
    if (this.indexes.has(fieldName)) return;
    
    const indexMap = new Map();
    this.indexes.set(fieldName, indexMap);

    // Populate index from existing documents
    for (const doc of this.documents) {
      const val = getNestedValue(doc, fieldName);
      if (val !== undefined) {
        if (!indexMap.has(val)) {
          indexMap.set(val, []);
        }
        indexMap.get(val).push(doc);
      }
    }
  }

  insert(doc) {
    const newDoc = deepClone(doc);
    if (newDoc._id === undefined) {
      newDoc._id = this.autoIncrementId++;
    }

    // Check unique ID constraint
    if (this.documents.some(d => d._id === newDoc._id)) {
      throw new Error(`DuplicateKeyError: _id=${newDoc._id} already exists`);
    }

    this.documents.push(newDoc);

    // Update indexes
    for (const [field, indexMap] of this.indexes.entries()) {
      const val = getNestedValue(newDoc, field);
      if (val !== undefined) {
        if (!indexMap.has(val)) {
          indexMap.set(val, []);
        }
        indexMap.get(val).push(newDoc);
      }
    }

    return deepClone(newDoc);
  }

  find(query = {}) {
    // Index acceleration optimization check
    const queryKeys = Object.keys(query);
    if (queryKeys.length === 1 && this.indexes.has(queryKeys[0])) {
      const field = queryKeys[0];
      const val = query[field];
      if (val !== null && typeof val !== 'object') {
        const indexedDocs = this.indexes.get(field).get(val) || [];
        return new Cursor(indexedDocs, {});
      }
    }

    return new Cursor(this.documents, query);
  }

  findOne(query = {}) {
    const results = this.find(query).limit(1).toArray();
    return results.length > 0 ? results[0] : null;
  }

  update(query, updateSpec, options = {}) {
    const matched = this.documents.filter(doc => matchDocument(doc, query));
    if (matched.length === 0 && options.upsert) {
      const upsertDoc = { ...query };
      this._applyUpdates(upsertDoc, updateSpec);
      return { matchedCount: 0, modifiedCount: 1, upsertedId: this.insert(upsertDoc)._id };
    }

    let modifiedCount = 0;
    for (const doc of matched) {
      // Save old index values to update them later
      const oldIndexValues = {};
      for (const field of this.indexes.keys()) {
        oldIndexValues[field] = getNestedValue(doc, field);
      }

      const changed = this._applyUpdates(doc, updateSpec);
      if (changed) {
        modifiedCount++;
        // Refresh indexes for modified doc
        for (const [field, indexMap] of this.indexes.entries()) {
          const oldVal = oldIndexValues[field];
          const newVal = getNestedValue(doc, field);
          if (oldVal !== newVal) {
            // Remove old reference
            if (oldVal !== undefined && indexMap.has(oldVal)) {
              const list = indexMap.get(oldVal);
              const idx = list.indexOf(doc);
              if (idx !== -1) list.splice(idx, 1);
            }
            // Add new reference
            if (newVal !== undefined) {
              if (!indexMap.has(newVal)) indexMap.set(newVal, []);
              indexMap.get(newVal).push(doc);
            }
          }
        }
      }
    }

    return { matchedCount: matched.length, modifiedCount };
  }

  remove(query) {
    const initialCount = this.documents.length;
    
    // Filter out matches
    const toRemove = [];
    const remaining = [];
    for (const doc of this.documents) {
      if (matchDocument(doc, query)) {
        toRemove.push(doc);
      } else {
        remaining.push(doc);
      }
    }

    this.documents = remaining;

    // Prune removed documents from indexes
    for (const doc of toRemove) {
      for (const [field, indexMap] of this.indexes.entries()) {
        const val = getNestedValue(doc, field);
        if (val !== undefined && indexMap.has(val)) {
          const list = indexMap.get(val);
          const idx = list.indexOf(doc);
          if (idx !== -1) list.splice(idx, 1);
        }
      }
    }

    return { deletedCount: initialCount - this.documents.length };
  }

  _applyUpdates(doc, updateSpec) {
    let changed = false;
    for (const op of Object.keys(updateSpec)) {
      const spec = updateSpec[op];
      switch (op) {
        case '$set':
          for (const path of Object.keys(spec)) {
            const val = spec[path];
            const parts = path.split('.');
            let cur = doc;
            for (let i = 0; i < parts.length - 1; i++) {
              cur[parts[i]] = cur[parts[i]] || {};
              cur = cur[parts[i]];
            }
            const lastKey = parts[parts.length - 1];
            if (!deepEquals(cur[lastKey], val)) {
              cur[lastKey] = deepClone(val);
              changed = true;
            }
          }
          break;
        case '$unset':
          for (const path of Object.keys(spec)) {
            const parts = path.split('.');
            let cur = doc;
            for (let i = 0; i < parts.length - 1; i++) {
              if (cur) cur = cur[parts[i]];
            }
            const lastKey = parts[parts.length - 1];
            if (cur && cur[lastKey] !== undefined) {
              delete cur[lastKey];
              changed = true;
            }
          }
          break;
        case '$inc':
          for (const path of Object.keys(spec)) {
            const incVal = spec[path];
            const parts = path.split('.');
            let cur = doc;
            for (let i = 0; i < parts.length - 1; i++) {
              cur[parts[i]] = cur[parts[i]] || {};
              cur = cur[parts[i]];
            }
            const lastKey = parts[parts.length - 1];
            const prev = Number(cur[lastKey]) || 0;
            cur[lastKey] = prev + incVal;
            changed = true;
          }
          break;
        case '$push':
          for (const path of Object.keys(spec)) {
            const val = spec[path];
            const parts = path.split('.');
            let cur = doc;
            for (let i = 0; i < parts.length - 1; i++) {
              cur[parts[i]] = cur[parts[i]] || {};
              cur = cur[parts[i]];
            }
            const lastKey = parts[parts.length - 1];
            if (!Array.isArray(cur[lastKey])) {
              cur[lastKey] = [];
            }
            cur[lastKey].push(deepClone(val));
            changed = true;
          }
          break;
      }
    }
    return changed;
  }
}

/**
 * DocumentDb manages collection registry and transactional ACID commits/rollbacks.
 */
export class DocumentDb {
  constructor() {
    this.collections = new Map();
    this.transactionSnapshot = null;
    this.inTransaction = false;
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Collection(name, this));
    }
    return this.collections.get(name);
  }

  beginTransaction() {
    if (this.inTransaction) {
      throw new Error('TransactionAlreadyStartedError: Nesting transactions not supported.');
    }
    this.inTransaction = true;
    this.transactionSnapshot = new Map();

    // Take complete snapshot copies of all collections
    for (const [name, col] of this.collections.entries()) {
      const snapCol = new Collection(name, this);
      snapCol.documents = deepClone(col.documents);
      snapCol.autoIncrementId = col.autoIncrementId;
      // Recreate index structures in snapshots
      for (const field of col.indexes.keys()) {
        snapCol.createIndex(field);
      }
      this.transactionSnapshot.set(name, snapCol);
    }
  }

  commit() {
    if (!this.inTransaction) {
      throw new Error('NoActiveTransactionError: Cannot commit state without active transaction.');
    }
    this.transactionSnapshot = null;
    this.inTransaction = false;
  }

  rollback() {
    if (!this.inTransaction) {
      throw new Error('NoActiveTransactionError: Cannot rollback state without active transaction.');
    }

    // Restore snapshots in-place to preserve Collection object references
    for (const [name, snapCol] of this.transactionSnapshot.entries()) {
      const col = this.collections.get(name);
      if (col) {
        col.documents = snapCol.documents;
        col.autoIncrementId = snapCol.autoIncrementId;
        col.indexes = snapCol.indexes;
      }
    }
    this.transactionSnapshot = null;
    this.inTransaction = false;
  }
}
