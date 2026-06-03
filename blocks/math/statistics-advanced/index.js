export class StatisticsAdvanced {
  /**
   * Helper to calculate mean of an array.
   */
  static mean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Helper to calculate sample variance.
   */
  static variance(arr, meanValue) {
    if (arr.length <= 1) return 0;
    const m = meanValue !== undefined ? meanValue : this.mean(arr);
    const sumSqDiff = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0);
    return sumSqDiff / (arr.length - 1);
  }

  /**
   * Performs an independent two-sample t-test (Welch's t-test for unequal variances/sizes).
   * @param {number[]} sample1
   * @param {number[]} sample2
   * @returns {Object} Welch's t-statistic results
   */
  static tTest(sample1, sample2) {
    const n1 = sample1.length;
    const n2 = sample2.length;

    if (n1 <= 1 || n2 <= 1) {
      throw new Error('Samples must have at least 2 observations');
    }

    const mean1 = this.mean(sample1);
    const mean2 = this.mean(sample2);

    const var1 = this.variance(sample1, mean1);
    const var2 = this.variance(sample2, mean2);

    const se = Math.sqrt(var1 / n1 + var2 / n2);
    if (se === 0) {
      return { tStatistic: 0, mean1, mean2 };
    }

    const tStatistic = (mean1 - mean2) / se;

    return { tStatistic, mean1, mean2 };
  }

  /**
   * Performs a one-way ANOVA (Analysis of Variance) F-test.
   * @param {number[][]} groups - Array of numerical samples, e.g. [[1, 2], [3, 4, 5], [5, 6]]
   * @returns {Object} One-way ANOVA F-statistic results
   */
  static anova(groups) {
    const k = groups.length;
    if (k < 2) {
      throw new Error('ANOVA requires at least 2 groups');
    }

    const groupMeans = [];
    const groupSizes = [];
    let grandSum = 0;
    let totalN = 0;

    for (let i = 0; i < k; i++) {
      const group = groups[i];
      if (group.length === 0) {
        throw new Error('Groups must not be empty');
      }
      const m = this.mean(group);
      groupMeans.push(m);
      groupSizes.push(group.length);
      grandSum += group.reduce((sum, val) => sum + val, 0);
      totalN += group.length;
    }

    const grandMean = grandSum / totalN;

    // Between-group sum of squares (SSB)
    let ssb = 0;
    for (let i = 0; i < k; i++) {
      ssb += groupSizes[i] * Math.pow(groupMeans[i] - grandMean, 2);
    }

    // Within-group sum of squares (SSW)
    let ssw = 0;
    for (let i = 0; i < k; i++) {
      const group = groups[i];
      const m = groupMeans[i];
      ssw += group.reduce((sum, val) => sum + Math.pow(val - m, 2), 0);
    }

    const dfBetween = k - 1;
    const dfWithin = totalN - k;

    if (dfWithin <= 0) {
      throw new Error('Insufficient total observations for ANOVA');
    }

    const msb = ssb / dfBetween;
    const msw = ssw / dfWithin;

    const fStatistic = msw === 0 ? 0 : msb / msw;

    return { fStatistic, dfBetween, dfWithin };
  }
}
