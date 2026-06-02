# Lego Block: `ml/neural-network`

A zero-dependency deep learning / backpropagation neural network engine in pure JavaScript. Supports arbitrary layers, dense layers, diverse activations (ReLU, Sigmoid, Tanh, Softmax), optimizers (SGD, Adam), and standard losses (MSE, Cross-entropy).

> [!NOTE]
> **AI Agent Context:** Use this block when you need to construct, train, fit, evaluate, and save/load custom feedforward neural network models in environments with zero access to external npm modules (e.g. tensorflow, onnx).

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add ml/neural-network
```

---

## API Specifications

### Parameters

*None*

---

## System Compatibility

| Runtime Environment | Status |
|---|---|
| **Browsers (Chrome, Safari, Firefox, Edge)** | ✅ Supported |
| **Node.js** | ✅ Supported |
| **Deno** | ✅ Supported |
| **Bun** | ✅ Supported |

---

## Computational Complexity

* **Time Complexity:** `O(E × N × L²) training (E = epochs, N = samples, L = layer size)`
* **Space Complexity:** `O(L²) weights`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
