export class PasswordStrength {
  static getEntropy(password) {
    if (!password) return 0;

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26; // Lowercase
    if (/[A-Z]/.test(password)) poolSize += 26; // Uppercase
    if (/[0-9]/.test(password)) poolSize += 10; // Numbers
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33; // Symbols/Special characters

    if (poolSize === 0) return 0;

    // Shannon Entropy formula: H = L * log2(R)
    return Math.round(password.length * Math.log2(poolSize));
  }

  static analyze(password) {
    const feedback = [];
    const checks = {
      length: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSpecial: /[^a-zA-Z0-9]/.test(password)
    };

    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long.');
    }
    if (!checks.hasLowercase) {
      feedback.push('Add lowercase letters.');
    }
    if (!checks.hasUppercase) {
      feedback.push('Add uppercase letters.');
    }
    if (!checks.hasDigit) {
      feedback.push('Add numbers.');
    }
    if (!checks.hasSpecial) {
      feedback.push('Add special characters.');
    }

    // Check for repetitive characters (e.g. "aaaaa", "11111")
    const repetitiveMatches = password.match(/(.)\1{2,}/g);
    if (repetitiveMatches) {
      feedback.push('Avoid repetitive characters.');
    }

    const entropy = this.getEntropy(password);
    let score = 0; // 0 to 4 rating scale
    if (entropy > 0) score++;
    if (entropy >= 40 && checks.length) score++;
    if (entropy >= 60 && (checks.hasLowercase && checks.hasUppercase)) score++;
    if (entropy >= 80 && checks.hasDigit && checks.hasSpecial) score++;

    let strength = 'very-weak';
    if (score === 1) strength = 'weak';
    else if (score === 2) strength = 'medium';
    else if (score === 3) strength = 'strong';
    else if (score === 4) strength = 'very-strong';

    return {
      score,
      strength,
      entropy,
      feedback,
      valid: checks.length && checks.hasLowercase && checks.hasUppercase && checks.hasDigit && checks.hasSpecial
    };
  }
}
