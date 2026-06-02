import { describe, it, expect } from '../../../test/test-harness.js';
import {DecisionTree} from './index.js';

  await describe('ml/decision-tree', async () => {
    await it('should train a classifier tree, make correct splits, evaluate regression variance, and support JSON serialization', () => {
      // 1. Classification test
      const X_cls = [[1.0], [2.0], [10.0], [11.0]];
      const y_cls = [0, 0, 1, 1];

      const tree = new DecisionTree({ criterion: 'gini', maxDepth: 3 });
      tree.fit(X_cls, y_cls);

      const predictions = tree.predict([[1.5], [10.5]]);
      expect(predictions).toEqual([0, 1]);

      // Verify serialization
      const json = tree.toJSON();
      const loadedTree = DecisionTree.fromJSON(json);
      expect(loadedTree.predict([[1.5], [10.5]])).toEqual([0, 1]);

      // 2. Regression MSE test
      const X_reg = [[1], [2], [3]];
      const y_reg = [10.0, 20.0, 30.0];
      const regTree = new DecisionTree({ criterion: 'mse' });
      regTree.fit(X_reg, y_reg);
      const regPred = regTree.predict([[1.5]]);
      expect(regPred[0]).toBe(10.0); // Split average of left leaf (samples <= 1.5)
    });
  });
