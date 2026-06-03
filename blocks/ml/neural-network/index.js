/**
 * Zero-Dependency Deep Learning Engine.
 * Features:
 * 1. Multidimensional Matrix Operations (dot product, element-wise arithmetic, transposition, broadcasting).
 * 2. Fully-Connected Dense Layer with advanced weight initializers (He, Xavier/Glorot, Random).
 * 3. Regularization Dropout Layer (with inverted scaling during forward training runs).
 * 4. Non-linear Activation functions with gradients: ReLU, Sigmoid, Tanh, Softmax.
 * 5. Gradient descent optimizer frameworks: SGD (with momentum) and Adam (with bias correction).
 * 6. Learning Rate Decay Schedulers (Step Decay and Exponential Decay).
 * 7. Loss functions: Mean Squared Error (MSE), Binary Cross-Entropy (BCE), Categorical Cross-Entropy (CCE).
 * 8. Model Training API: Batch fitting, evaluation metrics, predictions, weight export/import.
 * 9. K-Fold Cross Validation harness for robust performance metric estimation.
 * 10. Dataset Prep Utilities: MinMaxScaler, StandardScaler, Train-Test Splitter, One-Hot Encoder.
 */

// --- 1. Pure JS Matrix Mathematics Engine ---
export class Matrix {
  /**
   * Create a matrix from raw 2D array data or dimensions.
   */
  constructor(data) {
    if (Array.isArray(data)) {
      this.data = data;
      this.rows = data.length;
      this.cols = data[0] ? data[0].length : 0;
    } else {
      throw new Error('Matrix input data must be a 2D array.');
    }
  }

  static zeros(rows, cols) {
    const data = Array.from({ length: rows }, () => new Float64Array(cols));
    return new Matrix(data);
  }

  static ones(rows, cols) {
    const data = Array.from({ length: rows }, () => {
      const arr = new Float64Array(cols);
      arr.fill(1.0);
      return arr;
    });
    return new Matrix(data);
  }

  static seed = 42;
  static random() {
    Matrix.seed = (Matrix.seed * 1664525 + 1013904223) % 4294967296;
    return Matrix.seed / 4294967296;
  }

  /**
   * Standard Gaussian random using Box-Muller transform.
   */
  static randomNormal() {
    let u = 0, v = 0;
    while (u === 0) u = Matrix.random();
    while (v === 0) v = Matrix.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * Initialize weights using random normal distributions.
   */
  static randn(rows, cols, scale = 1.0) {
    const data = [];
    for (let r = 0; r < rows; r++) {
      const row = new Float64Array(cols);
      for (let c = 0; c < cols; c++) {
        row[c] = Matrix.randomNormal() * scale;
      }
      data.push(row);
    }
    return new Matrix(data);
  }

  /**
   * Xavier/Glorot weight initialization.
   */
  static initXavier(rows, cols) {
    const scale = Math.sqrt(2.0 / (rows + cols));
    return Matrix.randn(rows, cols, scale);
  }

  /**
   * He/Kaiming weight initialization (highly recommended for ReLU activations).
   */
  static initHe(rows, cols) {
    const scale = Math.sqrt(2.0 / rows);
    return Matrix.randn(rows, cols, scale);
  }

  /**
   * Element-wise operations mapping.
   */
  map(fn) {
    const data = [];
    for (let r = 0; r < this.rows; r++) {
      const row = new Float64Array(this.cols);
      for (let c = 0; c < this.cols; c++) {
        row[c] = fn(this.data[r][c], r, c);
      }
      data.push(row);
    }
    return new Matrix(data);
  }

  /**
   * Add matrices with support for basic broadcasting.
   */
  add(other) {
    if (other instanceof Matrix) {
      if (this.rows === other.rows && this.cols === other.cols) {
        return this.map((val, r, c) => val + other.data[r][c]);
      }
      // Broadcast bias row: (1, cols) into (rows, cols)
      if (other.rows === 1 && this.cols === other.cols) {
        return this.map((val, r, c) => val + other.data[0][c]);
      }
      // Broadcast bias col: (rows, 1) into (rows, cols)
      if (other.cols === 1 && this.rows === other.rows) {
        return this.map((val, r, c) => val + other.data[r][0]);
      }
      throw new Error(`MatrixDimensionMismatch: Cannot add shape ${this.rows}x${this.cols} and ${other.rows}x${other.cols}`);
    } else {
      // Scalar addition
      return this.map(val => val + other);
    }
  }

  /**
   * Subtract matrices or scalars.
   */
  sub(other) {
    if (other instanceof Matrix) {
      if (this.rows === other.rows && this.cols === other.cols) {
        return this.map((val, r, c) => val - other.data[r][c]);
      }
      if (other.rows === 1 && this.cols === other.cols) {
        return this.map((val, r, c) => val - other.data[0][c]);
      }
      if (other.cols === 1 && this.rows === other.rows) {
        return this.map((val, r, c) => val - other.data[r][0]);
      }
      throw new Error(`MatrixDimensionMismatch: Cannot subtract shape ${this.rows}x${this.cols} and ${other.rows}x${other.cols}`);
    } else {
      return this.map(val => val - other);
    }
  }

  /**
   * Multiply element-wise (Hadamard product) or scalar multiplication.
   */
  mul(other) {
    if (other instanceof Matrix) {
      if (this.rows === other.rows && this.cols === other.cols) {
        return this.map((val, r, c) => val * other.data[r][c]);
      }
      // Broadcast row
      if (other.rows === 1 && this.cols === other.cols) {
        return this.map((val, r, c) => val * other.data[0][c]);
      }
      throw new Error(`MatrixDimensionMismatch: Cannot element-wise multiply shape ${this.rows}x${this.cols} and ${other.rows}x${other.cols}`);
    } else {
      return this.map(val => val * other);
    }
  }

  /**
   * Dot product (matrix multiplication).
   */
  dot(other) {
    if (!(other instanceof Matrix)) {
      throw new TypeError('Argument of dot product must be a Matrix instance.');
    }
    if (this.cols !== other.rows) {
      throw new Error(`MatrixDimensionMismatch: Inner dimensions must match. Got ${this.rows}x${this.cols} and ${other.rows}x${other.cols}`);
    }

    const res = Matrix.zeros(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0.0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * other.data[k][j];
        }
        res.data[i][j] = sum;
      }
    }
    return res;
  }

  /**
   * Transpose matrix.
   */
  transpose() {
    const res = Matrix.zeros(this.cols, this.rows);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        res.data[c][r] = this.data[r][c];
      }
    }
    return res;
  }

  /**
   * Transpose matrix elements to raw JS array.
   */
  toArray() {
    const res = [];
    for (let r = 0; r < this.rows; r++) {
      res.push(Array.from(this.data[r]));
    }
    return res;
  }

  /**
   * Sum elements along dimensions (0 = columns, 1 = rows, null = total sum).
   */
  sum(axis = null) {
    if (axis === 0) {
      // Sum down columns (result is 1 x cols)
      const res = Matrix.zeros(1, this.cols);
      for (let c = 0; c < this.cols; c++) {
        let sum = 0.0;
        for (let r = 0; r < this.rows; r++) {
          sum += this.data[r][c];
        }
        res.data[0][c] = sum;
      }
      return res;
    } else if (axis === 1) {
      // Sum along rows (result is rows x 1)
      const res = Matrix.zeros(this.rows, 1);
      for (let r = 0; r < this.rows; r++) {
        let sum = 0.0;
        for (let c = 0; c < this.cols; c++) {
          sum += this.data[r][c];
        }
        res.data[r][0] = sum;
      }
      return res;
    } else {
      // Scalar sum
      let sum = 0.0;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          sum += this.data[r][c];
        }
      }
      return sum;
    }
  }

  mean() {
    return this.sum() / (this.rows * this.cols);
  }
}

// --- 2. Activation Functions Container ---
export const Activations = {
  sigmoid: {
    forward: (x) => 1.0 / (1.0 + Math.exp(-x)),
    backward: (fx) => fx * (1.0 - fx) // fx is sigmoid(x)
  },
  tanh: {
    forward: (x) => Math.tanh(x),
    backward: (fx) => 1.0 - fx * fx // fx is tanh(x)
  },
  relu: {
    forward: (x) => Math.max(0.0, x),
    backward: (fx) => (fx > 0.0 ? 1.0 : 0.0) // fx is relu(x)
  },
  linear: {
    forward: (x) => x,
    backward: () => 1.0
  },
  softmax: {
    forwardMatrix: (matrix) => {
      const data = [];
      for (let r = 0; r < matrix.rows; r++) {
        const row = matrix.data[r];
        const maxVal = Math.max(...row);
        const expRow = new Float64Array(matrix.cols);
        let sum = 0.0;
        for (let c = 0; c < matrix.cols; c++) {
          const expVal = Math.exp(row[c] - maxVal); // subtract max for numerical stability
          expRow[c] = expVal;
          sum += expVal;
        }
        for (let c = 0; c < matrix.cols; c++) {
          expRow[c] /= sum;
        }
        data.push(expRow);
      }
      return new Matrix(data);
    }
  }
};

// --- 3. Regularization & Neural Network Layers ---
export class DenseLayer {
  constructor(inputDim, outputDim, activation = 'relu', initMethod = 'he') {
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.activationName = activation.toLowerCase();
    this.activation = Activations[this.activationName];

    if (!this.activation && this.activationName !== 'softmax') {
      throw new Error(`Activation '${activation}' is not supported.`);
    }

    // Initialize weights
    if (initMethod === 'he') {
      this.weights = Matrix.initHe(inputDim, outputDim);
    } else if (initMethod === 'xavier' || initMethod === 'glorot') {
      this.weights = Matrix.initXavier(inputDim, outputDim);
    } else {
      this.weights = Matrix.randn(inputDim, outputDim, 0.01);
    }

    this.biases = Matrix.zeros(1, outputDim);

    // Activations caches
    this.inputs = null;
    this.z = null; // Pre-activation
    this.a = null; // Post-activation

    // Gradients caches
    this.dW = null;
    this.dB = null;

    // Optimizer cache parameters (e.g. Adam momentum/variance arrays)
    this.m_W = Matrix.zeros(inputDim, outputDim);
    this.v_W = Matrix.zeros(inputDim, outputDim);
    this.m_B = Matrix.zeros(1, outputDim);
    this.v_B = Matrix.zeros(1, outputDim);
  }

  /**
   * Forward pass.
   */
  forward(inputs) {
    this.inputs = inputs;
    this.z = inputs.dot(this.weights).add(this.biases);

    if (this.activationName === 'softmax') {
      this.a = Activations.softmax.forwardMatrix(this.z);
    } else {
      this.a = this.z.map(this.activation.forward);
    }
    return this.a;
  }

  /**
   * Backward pass.
   */
  backward(da) {
    let dz = null;

    if (this.activationName === 'softmax') {
      // Derivative of softmax is typically computed jointly with Categorical Cross Entropy.
      // If backpropagating manually outside CCE, it's passed directly as dz.
      dz = da;
    } else {
      // Element-wise chain rule multiplication: da * activation_derivative(a)
      dz = da.mul(this.a.map(this.activation.backward));
    }

    const batchSize = this.inputs.rows;

    // Calculate weight gradients: X_transposed . dZ
    this.dW = this.inputs.transpose().dot(dz).mul(1.0 / batchSize);
    // Calculate bias gradients: sum columns of dZ
    this.dB = dz.sum(0).mul(1.0 / batchSize);

    // Backpropagate error to previous layers: dZ . W_transposed
    return dz.dot(this.weights.transpose());
  }
}

export class DropoutLayer {
  constructor(rate = 0.5) {
    this.rate = rate;
    this.mask = null;
    this.isTraining = true;
  }

  forward(inputs) {
    if (this.isTraining && this.rate > 0.0) {
      const data = [];
      const scale = 1.0 / (1.0 - this.rate);
      for (let r = 0; r < inputs.rows; r++) {
        const row = new Float64Array(inputs.cols);
        for (let c = 0; c < inputs.cols; c++) {
          row[c] = Matrix.random() >= this.rate ? scale : 0.0;
        }
        data.push(row);
      }
      this.mask = new Matrix(data);
      return inputs.mul(this.mask);
    }
    return inputs;
  }

  backward(da) {
    if (this.isTraining && this.rate > 0.0) {
      return da.mul(this.mask);
    }
    return da;
  }
}

// --- 4. Optimization Frameworks ---
export class SGD {
  constructor(lr = 0.01, momentum = 0.9) {
    this.lr = lr;
    this.momentum = momentum;
    this.v_W = new Map(); // layer -> weight velocities
    this.v_B = new Map(); // layer -> bias velocities
  }

  update(layer) {
    if (!layer.weights) return; // Skip dropout regularization layers

    if (!this.v_W.has(layer)) {
      this.v_W.set(layer, Matrix.zeros(layer.weights.rows, layer.weights.cols));
      this.v_B.set(layer, Matrix.zeros(layer.biases.rows, layer.biases.cols));
    }

    const vel_W = this.v_W.get(layer);
    const vel_B = this.v_B.get(layer);

    // Apply momentum: v = momentum * v - lr * dW
    const new_vel_W = vel_W.mul(this.momentum).sub(layer.dW.mul(this.lr));
    const new_vel_B = vel_B.mul(this.momentum).sub(layer.dB.mul(this.lr));

    this.v_W.set(layer, new_vel_W);
    this.v_B.set(layer, new_vel_B);

    // Update weights and biases
    layer.weights = layer.weights.add(new_vel_W);
    layer.biases = layer.biases.add(new_vel_B);
  }
}

export class Adam {
  constructor(lr = 0.001, beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
    this.lr = lr;
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.eps = eps;
    this.t = 0;
  }

  update(layer) {
    if (!layer.weights) return; // Skip dropout layers

    // Increment step counter on first layer update of a batch pass
    if (this.t === 0) this.t = 1;

    // Weight Updates
    // m_W = beta1 * m_W + (1 - beta1) * dW
    layer.m_W = layer.m_W.mul(this.beta1).add(layer.dW.mul(1.0 - this.beta1));
    // v_W = beta2 * v_W + (1 - beta2) * dW^2
    layer.v_W = layer.v_W.mul(this.beta2).add(layer.dW.mul(layer.dW).mul(1.0 - this.beta2));

    // Bias Updates
    // m_B = beta1 * m_B + (1 - beta1) * dB
    layer.m_B = layer.m_B.mul(this.beta1).add(layer.dB.mul(1.0 - this.beta1));
    // v_B = beta2 * v_B + (1 - beta2) * dB^2
    layer.v_B = layer.v_B.mul(this.beta2).add(layer.dB.mul(layer.dB).mul(1.0 - this.beta2));

    // Bias corrections
    const m_W_corrected = layer.m_W.mul(1.0 / (1.0 - Math.pow(this.beta1, this.t)));
    const v_W_corrected = layer.v_W.mul(1.0 / (1.0 - Math.pow(this.beta2, this.t)));
    const m_B_corrected = layer.m_B.mul(1.0 / (1.0 - Math.pow(this.beta1, this.t)));
    const v_B_corrected = layer.v_B.mul(1.0 / (1.0 - Math.pow(this.beta2, this.t)));

    // Calculate parameter shifts: lr * m / (sqrt(v) + eps)
    const weightShift = m_W_corrected.map((val, r, c) => {
      return (this.lr * val) / (Math.sqrt(v_W_corrected.data[r][c]) + this.eps);
    });

    const biasShift = m_B_corrected.map((val, r, c) => {
      return (this.lr * val) / (Math.sqrt(v_B_corrected.data[r][c]) + this.eps);
    });

    layer.weights = layer.weights.sub(weightShift);
    layer.biases = layer.biases.sub(biasShift);
  }

  incrementStep() {
    this.t++;
  }
}

// --- 5. Learning Rate Schedulers ---
export class StepDecay {
  constructor(initialLr = 0.01, dropRate = 0.5, epochsDrop = 10) {
    this.initialLr = initialLr;
    this.dropRate = dropRate;
    this.epochsDrop = epochsDrop;
  }

  getLr(epoch) {
    return this.initialLr * Math.pow(this.dropRate, Math.floor((epoch + 1) / this.epochsDrop));
  }
}

export class ExponentialDecay {
  constructor(initialLr = 0.01, decayRate = 0.95) {
    this.initialLr = initialLr;
    this.decayRate = decayRate;
  }

  getLr(epoch) {
    return this.initialLr * Math.pow(this.decayRate, epoch);
  }
}

// --- 6. Loss Criteria ---
export const Losses = {
  mse: {
    forward: (pred, target) => {
      const diff = pred.sub(target);
      return diff.mul(diff).mean();
    },
    backward: (pred, target) => {
      // 2 * (pred - target) / total_elements
      return pred.sub(target).mul(2.0);
    }
  },
  binaryCrossEntropy: {
    forward: (pred, target) => {
      const eps = 1e-15;
      let totalLoss = 0.0;
      for (let r = 0; r < pred.rows; r++) {
        for (let c = 0; c < pred.cols; c++) {
          const p = Math.min(Math.max(pred.data[r][c], eps), 1.0 - eps);
          const t = target.data[r][c];
          totalLoss += -(t * Math.log(p) + (1.0 - t) * Math.log(1.0 - p));
        }
      }
      return totalLoss / (pred.rows * pred.cols);
    },
    backward: (pred, target) => {
      const eps = 1e-15;
      return pred.map((p, r, c) => {
        const t = target.data[r][c];
        const val = Math.min(Math.max(p, eps), 1.0 - eps);
        return -(t / val) + (1.0 - t) / (1.0 - val);
      });
    }
  },
  categoricalCrossEntropy: {
    forward: (pred, target) => {
      const eps = 1e-15;
      let totalLoss = 0.0;
      for (let r = 0; r < pred.rows; r++) {
        for (let c = 0; c < pred.cols; c++) {
          const p = Math.min(Math.max(pred.data[r][c], eps), 1.0 - eps);
          if (target.data[r][c] === 1.0) {
            totalLoss += -Math.log(p);
          }
        }
      }
      return totalLoss / pred.rows;
    },
    backward: (pred, target) => {
      // Handled together with softmax activation layers: pred - target
      return pred.sub(target);
    }
  }
};

// --- 7. Deep Neural Network Container ---
export class NeuralNetwork {
  constructor() {
    this.layers = [];
    this.optimizer = null;
    this.loss = null;
    this.lossName = null;
    this.lrScheduler = null;
  }

  /**
   * Add a layer to the network sequential block.
   */
  add(layer) {
    if (this.layers.length > 0) {
      let prev = null;
      for (let i = this.layers.length - 1; i >= 0; i--) {
        if (typeof this.layers[i].outputDim === 'number') {
          prev = this.layers[i];
          break;
        }
      }
      if (prev && typeof layer.inputDim === 'number' && prev.outputDim !== layer.inputDim) {
        throw new Error(`LayerDimensionMismatch: Added layer input dimension ${layer.inputDim} does not fit previous layer output dimension ${prev.outputDim}`);
      }
    }
    this.layers.push(layer);
  }

  /**
   * Compile the network with chosen optimizer, loss metrics, and optional scheduler.
   */
  compile(optimizer, loss = 'mse', lrScheduler = null) {
    this.optimizer = optimizer;
    this.lrScheduler = lrScheduler;
    this.lossName = loss.toLowerCase();

    if (this.lossName === 'mse') {
      this.loss = Losses.mse;
    } else if (this.lossName === 'bce' || this.lossName === 'binarycrossentropy') {
      this.loss = Losses.binaryCrossEntropy;
    } else if (this.lossName === 'cce' || this.lossName === 'categoricalcrossentropy') {
      this.loss = Losses.categoricalCrossEntropy;
    } else {
      throw new Error(`Loss function '${loss}' not supported.`);
    }
  }

  /**
   * Feedforward pass.
   */
  forward(inputs, isTraining = true) {
    let out = inputs;
    for (const layer of this.layers) {
      if (layer.hasOwnProperty('isTraining')) {
        layer.isTraining = isTraining;
      }
      out = layer.forward(out);
    }
    return out;
  }

  /**
   * Backpropagate gradients.
   */
  backward(lossGrad) {
    let grad = lossGrad;
    for (let i = this.layers.length - 1; i >= 0; i--) {
      grad = this.layers[i].backward(grad);
    }
  }

  /**
   * Update layer weights using compiled optimizer parameters.
   */
  update() {
    for (const layer of this.layers) {
      this.optimizer.update(layer);
    }
    if (this.optimizer.incrementStep) {
      this.optimizer.incrementStep();
    }
  }

  /**
   * Fit model on dataset inputs and target labels.
   */
  fit(X, y, epochs = 10, batchSize = 32, verbose = false) {
    if (!(X instanceof Matrix) || !(y instanceof Matrix)) {
      throw new TypeError('Inputs X and labels y must be Matrix instances.');
    }

    const nSamples = X.rows;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0.0;
      let batches = 0;

      // Apply learning rate scheduling if registered
      if (this.lrScheduler && this.optimizer) {
        this.optimizer.lr = this.lrScheduler.getLr(epoch);
      }

      // Shuffle dataset samples index indices
      const indices = Array.from({ length: nSamples }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Matrix.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      for (let i = 0; i < nSamples; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, nSamples);
        const batchIdx = indices.slice(i, batchEnd);

        // Construct mini-batch matrices
        const batchXData = batchIdx.map(idx => X.data[idx]);
        const batchYData = batchIdx.map(idx => y.data[idx]);

        const bx = new Matrix(batchXData);
        const by = new Matrix(batchYData);

        // Forward
        const pred = this.forward(bx, true);

        // Calculate Loss
        const lossVal = this.loss.forward(pred, by);
        epochLoss += lossVal;
        batches++;

        // Backward
        const lossGrad = this.loss.backward(pred, by);
        this.backward(lossGrad);

        // Apply weight mutations
        this.update();
      }

      const meanLoss = epochLoss / batches;
      if (verbose && (epoch === 0 || epoch === epochs - 1 || (epoch + 1) % Math.max(1, Math.floor(epochs / 10)) === 0)) {
        console.log(`Epoch ${epoch + 1}/${epochs} - Mean Loss: ${meanLoss.toFixed(6)}`);
      }
    }
  }

  /**
   * Predict output matrices (switches layers to inference mode).
   */
  predict(X) {
    if (!(X instanceof Matrix)) {
      throw new TypeError('Input X must be a Matrix instance.');
    }
    return this.forward(X, false);
  }

  /**
   * Evaluate predictions error metrics on test datasets.
   */
  evaluate(X, y) {
    const pred = this.predict(X);
    const loss = this.loss.forward(pred, y);

    // Calculate accuracy if classification task
    let accuracy = null;
    if (this.lossName === 'cce' || this.layers[this.layers.length - 1].activationName === 'softmax') {
      let correct = 0;
      for (let r = 0; r < pred.rows; r++) {
        const predRow = pred.data[r];
        const targetRow = y.data[r];
        const predIdx = predRow.indexOf(Math.max(...predRow));
        const targetIdx = targetRow.indexOf(Math.max(...targetRow));
        if (predIdx === targetIdx) correct++;
      }
      accuracy = correct / pred.rows;
    } else if (this.lossName === 'bce') {
      let correct = 0;
      for (let r = 0; r < pred.rows; r++) {
        const p = pred.data[r][0] >= 0.5 ? 1.0 : 0.0;
        const t = y.data[r][0];
        if (p === t) correct++;
      }
      accuracy = correct / pred.rows;
    }

    return { loss, accuracy };
  }

  /**
   * Serialize network weights and topology to JSON.
   */
  save() {
    const serializedLayers = this.layers.map(layer => {
      if (layer instanceof DropoutLayer) {
        return {
          type: 'dropout',
          rate: layer.rate
        };
      }
      return {
        type: 'dense',
        inputDim: layer.inputDim,
        outputDim: layer.outputDim,
        activationName: layer.activationName,
        weights: layer.weights.toArray(),
        biases: layer.biases.toArray()
      };
    });
    return JSON.stringify({
      lossName: this.lossName,
      layers: serializedLayers
    });
  }

  /**
   * Deserialize network weights and topology from JSON.
   */
  static load(jsonString, optimizer) {
    const config = JSON.parse(jsonString);
    const net = new NeuralNetwork();

    for (const layerCfg of config.layers) {
      if (layerCfg.type === 'dropout') {
        net.add(new DropoutLayer(layerCfg.rate));
      } else {
        const layer = new DenseLayer(layerCfg.inputDim, layerCfg.outputDim, layerCfg.activationName);
        layer.weights = new Matrix(layerCfg.weights.map(row => new Float64Array(row)));
        layer.biases = new Matrix(layerCfg.biases.map(row => new Float64Array(row)));
        net.add(layer);
      }
    }

    net.compile(optimizer, config.lossName);
    return net;
  }
}

// --- 8. K-Fold Validation Harness ---
/**
 * Run cross-validation evaluating convergence and error parameters.
 */
export function kFoldCrossValidation(X, y, k = 5, layerFactory, compileFn, epochs = 20, batchSize = 16) {
  if (X.rows !== y.rows) {
    throw new Error('X and y must have the same number of sample rows.');
  }

  const nSamples = X.rows;
  const foldSize = Math.floor(nSamples / k);
  const indices = Array.from({ length: nSamples }, (_, i) => i);

  // Shuffle indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Matrix.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const scores = [];

  for (let fold = 0; fold < k; fold++) {
    const valStart = fold * foldSize;
    const valEnd = valStart + foldSize;

    const valIdx = indices.slice(valStart, valEnd);
    const trainIdx = [...indices.slice(0, valStart), ...indices.slice(valEnd)];

    const XTrain = new Matrix(trainIdx.map(idx => X.data[idx]));
    const yTrain = new Matrix(trainIdx.map(idx => y.data[idx]));
    const XVal = new Matrix(valIdx.map(idx => X.data[idx]));
    const yVal = new Matrix(valIdx.map(idx => y.data[idx]));

    const net = new NeuralNetwork();
    layerFactory(net);
    compileFn(net);

    net.fit(XTrain, yTrain, epochs, batchSize, false);
    const metric = net.evaluate(XVal, yVal);
    scores.push(metric);
  }

  return scores;
}

// --- 9. Machine Learning Dataset Prep Utilities ---
export class MinMaxScaler {
  constructor() {
    this.min = null;
    this.max = null;
  }

  fit(matrix) {
    const minArr = new Float64Array(matrix.cols);
    const maxArr = new Float64Array(matrix.cols);

    for (let c = 0; c < matrix.cols; c++) {
      let cMin = Infinity;
      let cMax = -Infinity;
      for (let r = 0; r < matrix.rows; r++) {
        const val = matrix.data[r][c];
        if (val < cMin) cMin = val;
        if (val > cMax) cMax = val;
      }
      minArr[c] = cMin;
      maxArr[c] = cMax;
    }

    this.min = minArr;
    this.max = maxArr;
  }

  transform(matrix) {
    const data = [];
    for (let r = 0; r < matrix.rows; r++) {
      const row = new Float64Array(matrix.cols);
      for (let c = 0; c < matrix.cols; c++) {
        const range = this.max[c] - this.min[c];
        row[c] = range === 0 ? 0.0 : (matrix.data[r][c] - this.min[c]) / range;
      }
      data.push(row);
    }
    return new Matrix(data);
  }

  fitTransform(matrix) {
    this.fit(matrix);
    return this.transform(matrix);
  }

  inverseTransform(matrix) {
    const data = [];
    for (let r = 0; r < matrix.rows; r++) {
      const row = new Float64Array(matrix.cols);
      for (let c = 0; c < matrix.cols; c++) {
        row[c] = matrix.data[r][c] * (this.max[c] - this.min[c]) + this.min[c];
      }
      data.push(row);
    }
    return new Matrix(data);
  }
}

export class StandardScaler {
  constructor() {
    this.mean = null;
    this.std = null;
  }

  fit(matrix) {
    const meanArr = new Float64Array(matrix.cols);
    const stdArr = new Float64Array(matrix.cols);

    for (let c = 0; c < matrix.cols; c++) {
      let sum = 0.0;
      for (let r = 0; r < matrix.rows; r++) {
        sum += matrix.data[r][c];
      }
      const mean = sum / matrix.rows;
      meanArr[c] = mean;

      let varianceSum = 0.0;
      for (let r = 0; r < matrix.rows; r++) {
        varianceSum += Math.pow(matrix.data[r][c] - mean, 2);
      }
      const variance = varianceSum / matrix.rows;
      stdArr[c] = Math.sqrt(variance);
    }

    this.mean = meanArr;
    this.std = stdArr;
  }

  transform(matrix) {
    const data = [];
    for (let r = 0; r < matrix.rows; r++) {
      const row = new Float64Array(matrix.cols);
      for (let c = 0; c < matrix.cols; c++) {
        const standardDeviation = this.std[c];
        row[c] = standardDeviation === 0 ? 0.0 : (matrix.data[r][c] - this.mean[c]) / standardDeviation;
      }
      data.push(row);
    }
    return new Matrix(data);
  }

  fitTransform(matrix) {
    this.fit(matrix);
    return this.transform(matrix);
  }

  inverseTransform(matrix) {
    const data = [];
    for (let r = 0; r < matrix.rows; r++) {
      const row = new Float64Array(matrix.cols);
      for (let c = 0; c < matrix.cols; c++) {
        row[c] = matrix.data[r][c] * this.std[c] + this.mean[c];
      }
      data.push(row);
    }
    return new Matrix(data);
  }
}

/**
 * Split datasets into random training and testing slices.
 */
export function trainTestSplit(X, y, testSize = 0.2, shuffle = true) {
  if (X.rows !== y.rows) {
    throw new Error('X and y must have the same number of sample rows.');
  }

  const nSamples = X.rows;
  const nTest = Math.round(nSamples * testSize);
  const indices = Array.from({ length: nSamples }, (_, i) => i);

  if (shuffle) {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Matrix.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }

  const testIndices = indices.slice(0, nTest);
  const trainIndices = indices.slice(nTest);

  const XTrain = new Matrix(trainIndices.map(idx => X.data[idx]));
  const XTest = new Matrix(testIndices.map(idx => X.data[idx]));
  const yTrain = new Matrix(trainIndices.map(idx => y.data[idx]));
  const yTest = new Matrix(testIndices.map(idx => y.data[idx]));

  return { XTrain, XTest, yTrain, yTest };
}

/**
 * Perform one-hot encoding representation for integers labels.
 */
export function oneHotEncode(labels, numClasses) {
  const data = [];
  for (let i = 0; i < labels.length; i++) {
    const row = new Float64Array(numClasses);
    const val = Math.floor(labels[i]);
    if (val >= 0 && val < numClasses) {
      row[val] = 1.0;
    }
    data.push(row);
  }
  return new Matrix(data);
}
