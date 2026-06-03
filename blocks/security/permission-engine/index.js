function matchWildcard(pattern, value) {
  if (!pattern || !value) return false;
  if (pattern === '*') return true;
  if (pattern === value) return true;
  if (pattern.includes('*')) {
    const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    return regex.test(value);
  }
  return false;
}

export class PermissionEngine {
  #roles = new Map(); // role -> Set of parent/inherited roles
  #policies = [];

  addRole(role, inherits = []) {
    if (typeof role !== 'string' || !role) {
      throw new Error('Role name must be a non-empty string');
    }
    const inheritsArray = Array.isArray(inherits) ? inherits : [inherits];
    
    if (!this.#roles.has(role)) {
      this.#roles.set(role, new Set());
    }
    
    const inheritedSet = this.#roles.get(role);
    for (const parent of inheritsArray) {
      if (parent && typeof parent === 'string') {
        inheritedSet.add(parent);
      }
    }
    return this;
  }

  addPolicy(policy = {}) {
    const {
      role = '*',
      action = '*',
      resource = '*',
      effect = 'allow',
      condition = null
    } = policy;

    if (effect !== 'allow' && effect !== 'deny') {
      throw new Error("Policy effect must be 'allow' or 'deny'");
    }

    this.#policies.push({
      role,
      action,
      resource,
      effect,
      condition
    });

    return this;
  }

  // Resolve all roles including inherited ones
  #resolveRoles(roles, visited = new Set()) {
    const roleList = Array.isArray(roles) ? roles : [roles];
    const resolved = new Set();

    for (const role of roleList) {
      if (!role || typeof role !== 'string') continue;
      if (visited.has(role)) continue;
      
      visited.add(role);
      resolved.add(role);

      const parents = this.#roles.get(role);
      if (parents) {
        const inherited = this.#resolveRoles([...parents], visited);
        for (const r of inherited) {
          resolved.add(r);
        }
      }
    }

    return resolved;
  }

  check(roles, action, resource, context = {}) {
    const resolvedRoles = this.#resolveRoles(roles);
    
    let allowed = false;
    let denied = false;

    for (const policy of this.#policies) {
      // 1. Check Role Match (policy role can be wildcard or match any of resolved roles)
      const roleMatch = policy.role === '*' || [...resolvedRoles].some(r => matchWildcard(policy.role, r));
      if (!roleMatch) continue;

      // 2. Check Action Match
      if (!matchWildcard(policy.action, action)) continue;

      // 3. Check Resource Match
      if (!matchWildcard(policy.resource, resource)) continue;

      // 4. Check dynamic ABAC condition (if any)
      if (policy.condition && typeof policy.condition === 'function') {
        try {
          if (!policy.condition(context)) {
            continue; // Condition did not pass, skip policy
          }
        } catch (err) {
          // If condition throws, fail-safe: ignore the policy or treat as not matching
          continue;
        }
      }

      // Apply effect
      if (policy.effect === 'deny') {
        denied = true;
      } else if (policy.effect === 'allow') {
        allowed = true;
      }
    }

    // Deny takes absolute precedence
    if (denied) return false;
    return allowed;
  }

  clear() {
    this.#roles.clear();
    this.#policies = [];
  }
}
