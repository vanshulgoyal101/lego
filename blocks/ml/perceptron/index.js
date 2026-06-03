export class Perceptron {
  /**
   * @param {number} inputSize - Dimension of input vectors
   * @param {number} [learningRate=0.1] - Speed of weight adjustment
   * @param {number} [epochs=100] - Number of training iterations
   */
  constructor(inputSize, learningRate = 0.1, epochs = 100) {
    this.weights = new Array(inputSize).fill(0);
    this.bias = 0;
    this.learningRate = learningRate;
    this.epochs = epochs;
  }

  /**
   * Predict the output binary class for given inputs.
   * @param {number[]} inputs
   * @returns {number} 0 or 1
   */
  predict(inputs) {
    if (inputs.length !== this.weights.length) {
      throw new Error('Input size mismatch');
    }
    
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum >= 0 ? 1 : 0;
  }

  /**
   * Fits the perceptron model to the dataset.
   * @param {Object[]} dataset - Array of { inputs: number[], label: 0|1 }
   */
  train(dataset) {
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      let errors = 0;
      for (const { inputs, label } of dataset) {
        const prediction = this.predict(inputs);
        const error = label - prediction;
        
        if (error !== 0) {
          errors++;
          // Update weights and bias
          for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] += this.learningRate * error * inputs[i];
          }
          this.bias += this.learningRate * error;
        }
      }
      if (errors === 0) {
        break; // Dataset is linearly separated
      }
    }
  }
}
