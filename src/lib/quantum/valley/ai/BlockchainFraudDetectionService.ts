/**
 * Blockchain Fraud Detection Service
 * 
 * Implements AI models for detecting fraudulent transactions in blockchain networks.
 * Uses logistic regression and neural networks for classification.
 */

export interface FraudDetectionMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  modelTrainingTime: number;
}

export interface TransactionFeatures {
  amount: number;
  timePattern: number;     // Time of day normalized [0,1]
  userHistory: number;     // User reputation score [0,1]
  networkActivity: number; // Network congestion [0,1]
  gasPrice: number;        // Gas price relative to average
}

export interface FraudPrediction {
  isFraud: boolean;
  probability: number;
  confidence: number;
  riskFactors: string[];
}

export class BlockchainFraudDetectionService {
  private logisticRegression: LogisticRegressionModel;
  private neuralNetwork: SimpleNeuralNetwork;
  private metrics: FraudDetectionMetrics;
  private trainingData: TransactionFeatures[] = [];
  private trainingLabels: number[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.logisticRegression = new LogisticRegressionModel();
    this.neuralNetwork = new SimpleNeuralNetwork();
    this.metrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      falsePositiveRate: 0,
      modelTrainingTime: 0
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Generate synthetic training data
    this.generateTrainingData();
    
    // Train models
    const startTime = Date.now();
    await this.trainModels();
    this.metrics.modelTrainingTime = Date.now() - startTime;
    
    this.isInitialized = true;
    console.log("Blockchain fraud detection service initialized");
  }

  /**
   * Generate synthetic training data for fraud detection
   */
  private generateTrainingData(): void {
    // Normal transactions
    for (let i = 0; i < 1000; i++) {
      this.trainingData.push({
        amount: Math.random() * 1000 + 10,        // $10-$1010
        timePattern: Math.random() * 0.8 + 0.1,   // Normal business hours
        userHistory: Math.random() * 0.8 + 0.2,   // Good reputation
        networkActivity: Math.random() * 0.7 + 0.2, // Normal activity
        gasPrice: Math.random() * 0.6 + 0.8       // Normal gas prices
      });
      this.trainingLabels.push(0); // Not fraud
    }

    // Fraudulent transactions
    for (let i = 0; i < 200; i++) {
      this.trainingData.push({
        amount: Math.random() * 50000 + 5000,     // Large amounts
        timePattern: Math.random() * 0.3,         // Unusual hours
        userHistory: Math.random() * 0.3,         // Poor reputation
        networkActivity: Math.random() * 0.5,     // Variable activity
        gasPrice: Math.random() * 2 + 1.5         // High gas prices
      });
      this.trainingLabels.push(1); // Fraud
    }

    console.log(`Generated ${this.trainingData.length} training samples`);
  }

  /**
   * Train both logistic regression and neural network models
   */
  private async trainModels(): Promise<void> {
    const features = this.trainingData.map(tx => [
      tx.amount / 10000,        // Normalize amount
      tx.timePattern,
      tx.userHistory,
      tx.networkActivity,
      tx.gasPrice / 3           // Normalize gas price
    ]);

    // Train logistic regression
    await this.logisticRegression.train(features, this.trainingLabels);
    
    // Train neural network
    await this.neuralNetwork.train(features, this.trainingLabels);

    // Calculate metrics
    this.calculateMetrics(features, this.trainingLabels);
  }

  /**
   * Detect fraud in a transaction
   */
  async detectFraud(transactionData: number[]): Promise<number> {
    if (!this.isInitialized) await this.initialize();

    // Use ensemble of models
    const logisticProb = this.logisticRegression.predict(transactionData);
    const neuralProb = this.neuralNetwork.predict(transactionData);
    
    // Weighted average (logistic regression gets higher weight for stability)
    return 0.6 * logisticProb + 0.4 * neuralProb;
  }

  /**
   * Comprehensive fraud analysis
   */
  async analyzeFraud(transaction: TransactionFeatures): Promise<FraudPrediction> {
    if (!this.isInitialized) await this.initialize();

    const features = [
      transaction.amount / 10000,
      transaction.timePattern,
      transaction.userHistory,
      transaction.networkActivity,
      transaction.gasPrice / 3
    ];

    const probability = await this.detectFraud(features);
    const confidence = Math.abs(probability - 0.5) * 2;
    const isFraud = probability > 0.7;

    // Identify risk factors
    const riskFactors: string[] = [];
    if (transaction.amount > 5000) riskFactors.push("High transaction amount");
    if (transaction.timePattern < 0.2) riskFactors.push("Unusual transaction time");
    if (transaction.userHistory < 0.3) riskFactors.push("Poor user reputation");
    if (transaction.gasPrice > 2.0) riskFactors.push("Unusually high gas price");
    if (transaction.networkActivity < 0.2) riskFactors.push("Low network activity");

    return {
      isFraud,
      probability,
      confidence,
      riskFactors
    };
  }

  /**
   * Batch process multiple transactions
   */
  async batchAnalyze(transactions: TransactionFeatures[]): Promise<{
    results: FraudPrediction[];
    fraudCount: number;
    highRiskCount: number;
    averageRisk: number;
  }> {
    const results: FraudPrediction[] = [];
    let fraudCount = 0;
    let highRiskCount = 0;
    let totalRisk = 0;

    for (const transaction of transactions) {
      const result = await this.analyzeFraud(transaction);
      results.push(result);
      
      if (result.isFraud) fraudCount++;
      if (result.probability > 0.5) highRiskCount++;
      totalRisk += result.probability;
    }

    return {
      results,
      fraudCount,
      highRiskCount,
      averageRisk: totalRisk / transactions.length
    };
  }

  /**
   * Calculate model performance metrics
   */
  private calculateMetrics(features: number[][], labels: number[]): void {
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < features.length; i++) {
      const prediction = this.logisticRegression.predict(features[i]) > 0.5 ? 1 : 0;
      const actual = labels[i];

      if (prediction === 1 && actual === 1) truePositives++;
      else if (prediction === 1 && actual === 0) falsePositives++;
      else if (prediction === 0 && actual === 0) trueNegatives++;
      else if (prediction === 0 && actual === 1) falseNegatives++;
    }

    this.metrics.accuracy = (truePositives + trueNegatives) / features.length;
    this.metrics.precision = truePositives / (truePositives + falsePositives) || 0;
    this.metrics.recall = truePositives / (truePositives + falseNegatives) || 0;
    this.metrics.f1Score = 2 * (this.metrics.precision * this.metrics.recall) / 
                          (this.metrics.precision + this.metrics.recall) || 0;
    this.metrics.falsePositiveRate = falsePositives / (falsePositives + trueNegatives) || 0;
  }

  /**
   * Update model with new data
   */
  async updateModel(
    newTransactions: TransactionFeatures[], 
    newLabels: number[]
  ): Promise<void> {
    // Add new data to training set
    this.trainingData.push(...newTransactions);
    this.trainingLabels.push(...newLabels);

    // Retrain models
    await this.trainModels();
  }

  /**
   * Get service metrics
   */
  async getMetrics(): Promise<FraudDetectionMetrics> {
    return { ...this.metrics };
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.trainingData = [];
    this.trainingLabels = [];
    this.metrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      falsePositiveRate: 0,
      modelTrainingTime: 0
    };
    this.isInitialized = false;
  }
}

/**
 * Logistic Regression Model
 * Formula: p = 1 / (1 + e^(-(β₀ + β₁x₁ + ... + βₙxₙ)))
 */
class LogisticRegressionModel {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number = 0.01;

  async train(features: number[][], labels: number[], epochs: number = 100): Promise<void> {
    const numFeatures = features[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < features.length; i++) {
        const prediction = this.predict(features[i]);
        const error = labels[i] - prediction;

        // Update weights using gradient descent
        for (let j = 0; j < numFeatures; j++) {
          this.weights[j] += this.learningRate * error * features[i][j];
        }
        this.bias += this.learningRate * error;
      }
    }
  }

  predict(features: number[]): number {
    let logit = this.bias;
    for (let i = 0; i < features.length; i++) {
      logit += this.weights[i] * features[i];
    }
    return 1 / (1 + Math.exp(-logit)); // Sigmoid function
  }
}

/**
 * Simple Neural Network
 * Formula: h = σ(Wx + b), y = σ(Vh + c)
 */
class SimpleNeuralNetwork {
  private weights1: number[][] = [];
  private bias1: number[] = [];
  private weights2: number[] = [];
  private bias2: number = 0;
  private hiddenSize: number = 8;
  private learningRate: number = 0.01;

  async train(features: number[][], labels: number[], epochs: number = 100): Promise<void> {
    const inputSize = features[0].length;
    
    // Initialize weights randomly
    this.weights1 = Array.from({length: this.hiddenSize}, () => 
      Array.from({length: inputSize}, () => (Math.random() - 0.5) * 2)
    );
    this.bias1 = new Array(this.hiddenSize).fill(0);
    this.weights2 = Array.from({length: this.hiddenSize}, () => (Math.random() - 0.5) * 2);
    this.bias2 = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < features.length; i++) {
        const { hidden, output } = this.forward(features[i]);
        const error = labels[i] - output;

        // Backpropagation
        // Output layer
        for (let j = 0; j < this.hiddenSize; j++) {
          this.weights2[j] += this.learningRate * error * hidden[j];
        }
        this.bias2 += this.learningRate * error;

        // Hidden layer
        for (let j = 0; j < this.hiddenSize; j++) {
          const hiddenError = error * this.weights2[j] * hidden[j] * (1 - hidden[j]);
          for (let k = 0; k < inputSize; k++) {
            this.weights1[j][k] += this.learningRate * hiddenError * features[i][k];
          }
          this.bias1[j] += this.learningRate * hiddenError;
        }
      }
    }
  }

  private forward(features: number[]): { hidden: number[]; output: number } {
    // Hidden layer
    const hidden = this.weights1.map((weights, i) => {
      let sum = this.bias1[i];
      for (let j = 0; j < features.length; j++) {
        sum += weights[j] * features[j];
      }
      return this.sigmoid(sum);
    });

    // Output layer
    let output = this.bias2;
    for (let i = 0; i < this.hiddenSize; i++) {
      output += this.weights2[i] * hidden[i];
    }
    output = this.sigmoid(output);

    return { hidden, output };
  }

  predict(features: number[]): number {
    return this.forward(features).output;
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
}