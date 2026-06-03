import { describe, it, expect } from '../../../test/test-harness.js';
import {Matrix as MlMatrix,  DenseLayer,  DropoutLayer, SGD as MlSgd, Adam as MlAdam,  NeuralNetwork,  MinMaxScaler,  StandardScaler,  trainTestSplit} from './index.js';

  await describe('ml/neural-network', async () => {
    await it('should execute matrix arithmetic, scaling, and train a model to classify XOR values', async () => {
      MlMatrix.seed = 42; // Enforce deterministic execution for verification runs
      // 1. Test Matrix math
      const m1 = new MlMatrix([[1, 2], [3, 4]]);
      const m2 = new MlMatrix([[2, 0], [1, 2]]);
      const dotRes = m1.dot(m2);
      expect(dotRes.toArray()).toEqual([[4, 4], [10, 8]]);

      // 2. Test Scalers
      const scaler = new MinMaxScaler();
      const rawData = new MlMatrix([[10], [20], [30]]);
      const scaled = scaler.fitTransform(rawData);
      expect(scaled.toArray()).toEqual([[0], [0.5], [1.0]]);
      expect(scaler.inverseTransform(scaled).toArray()).toEqual([[10], [20], [30]]);

      // 3. Test Neural Network training (XOR gate)
      const X = new MlMatrix([[0, 0], [0, 1], [1, 0], [1, 1]]);
      const y = new MlMatrix([[0], [1], [1], [0]]);

      MlMatrix.seed = 5; // Use seed 5 which guarantees convergence on XOR within 200 epochs
      const net = new NeuralNetwork();
      net.add(new DenseLayer(2, 4, 'relu', 'he'));
      net.add(new DenseLayer(4, 1, 'sigmoid', 'xavier'));

      const opt = new MlAdam(0.1);
      net.compile(opt, 'bce');

      // Train for 200 epochs to ensure convergence
      net.fit(X, y, 200, 4, false);

      const evalMetrics = net.evaluate(X, y);
      expect(evalMetrics.loss < 0.1).toBe(true);
      expect(evalMetrics.accuracy).toBe(1.0);

      // 4. Test Model Serialization (Save & Load)
      const savedWeights = net.save();
      const loadedNet = NeuralNetwork.load(savedWeights, new MlAdam(0.1));
      const loadedEval = loadedNet.evaluate(X, y);
      expect(loadedEval.loss).toBe(evalMetrics.loss);

      // 5. Test Dropout Activation Layer
      const dropout = new DropoutLayer(0.5);
      dropout.isTraining = false;
      const testInputs = new MlMatrix([[1, 2, 3]]);
      const outInference = dropout.forward(testInputs);
      expect(outInference.toArray()).toEqual([[1, 2, 3]]);

      // 6. Test Sequential addition of DropoutLayer
      const netWithDropout = new NeuralNetwork();
      netWithDropout.add(new DenseLayer(2, 4));
      netWithDropout.add(new DropoutLayer(0.2));
      netWithDropout.add(new DenseLayer(4, 1));
      expect(netWithDropout.layers.length).toBe(3);
    });
  });
