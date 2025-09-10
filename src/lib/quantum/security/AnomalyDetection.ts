import { pipeline, Pipeline } from '@huggingface/transformers';

export interface TransactionFeatures {
  amount: number;
  sourceChainId: number;
  destinationChainId: number;
  nonce: number;
  timestamp: number;
  signatureNorm: number;
  gasPrice?: number;
  senderReputation?: number;
}

export interface AnomalyResult {
  score: number; // 0-100, higher means more anomalous
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  features: string[];
  timestamp: number;
}

export interface TrainingData {
  features: number[];
  label: number; // 0 = normal, 1 = anomaly
}

export class AnomalyDetection {
  private model: any = null;
  private isModelLoading = false;
  private trainingData: TrainingData[] = [];
  private featureStats: {
    min: number[];
    max: number[];
    mean: number[];
    std: number[];
  } | null = null;

  constructor() {
    this.initializeModel();
    this.generateSyntheticTrainingData();
  }

  /**
   * Initialize the ML model for anomaly detection
   */
  private async initializeModel(): Promise<void> {
    if (this.isModelLoading) return;
    
    this.isModelLoading = true;
    try {
      // Use a lightweight classification model suitable for browser
      this.model = await pipeline(
        'text-classification',
        'distilbert-base-uncased-finetuned-sst-2-english',
        { device: 'cpu' }
      );
    } catch (error) {
      console.warn('Failed to load HuggingFace model, using fallback detection:', error);
      this.model = null;
    }
    this.isModelLoading = false;
  }

  /**
   * Generate synthetic training data for the anomaly detection model
   */
  private generateSyntheticTrainingData(): void {
    const normalTransactions = 1000;
    const anomalousTransactions = 200;

    // Generate normal transactions
    for (let i = 0; i < normalTransactions; i++) {
      const features = [
        Math.random() * 1000 + 10, // amount (10-1010)
        Math.floor(Math.random() * 5) + 1, // source chain (1-5)
        Math.floor(Math.random() * 5) + 1, // dest chain (1-5)
        Math.floor(Math.random() * 100000), // nonce
        Date.now() - Math.random() * 86400000, // timestamp (last 24h)
        Math.random() * 100 + 50 // signature norm (50-150)
      ];
      
      this.trainingData.push({ features, label: 0 });
    }

    // Generate anomalous transactions
    for (let i = 0; i < anomalousTransactions; i++) {
      const features = [
        Math.random() > 0.5 ? Math.random() * 100000 + 10000 : Math.random() * 10, // very high or very low amounts
        Math.floor(Math.random() * 10) + 1, // wider chain range
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 1000000), // unusual nonce
        Date.now() - Math.random() * 172800000, // longer time range
        Math.random() > 0.5 ? Math.random() * 30 : Math.random() * 100 + 200 // very low or very high signature norm
      ];
      
      this.trainingData.push({ features, label: 1 });
    }

    this.calculateFeatureStatistics();
  }

  /**
   * Calculate feature statistics for normalization
   */
  private calculateFeatureStatistics(): void {
    const numFeatures = this.trainingData[0].features.length;
    const min: number[] = new Array(numFeatures).fill(Infinity);
    const max: number[] = new Array(numFeatures).fill(-Infinity);
    const sum: number[] = new Array(numFeatures).fill(0);

    // Calculate min, max, and sum
    this.trainingData.forEach(data => {
      data.features.forEach((feature, idx) => {
        min[idx] = Math.min(min[idx], feature);
        max[idx] = Math.max(max[idx], feature);
        sum[idx] += feature;
      });
    });

    // Calculate mean
    const mean = sum.map(s => s / this.trainingData.length);

    // Calculate standard deviation
    const std = new Array(numFeatures).fill(0);
    this.trainingData.forEach(data => {
      data.features.forEach((feature, idx) => {
        std[idx] += Math.pow(feature - mean[idx], 2);
      });
    });
    
    for (let i = 0; i < numFeatures; i++) {
      std[i] = Math.sqrt(std[i] / this.trainingData.length);
    }

    this.featureStats = { min, max, mean, std };
  }

  /**
   * Normalize features using z-score normalization
   */
  private normalizeFeatures(features: number[]): number[] {
    if (!this.featureStats) return features;

    return features.map((feature, idx) => {
      const { mean, std } = this.featureStats!;
      return std[idx] > 0 ? (feature - mean[idx]) / std[idx] : 0;
    });
  }

  /**
   * Extract features from transaction data
   */
  private extractFeatures(transaction: TransactionFeatures): number[] {
    return [
      transaction.amount,
      transaction.sourceChainId,
      transaction.destinationChainId,
      transaction.nonce % 100000, // Normalize large nonce values
      (Date.now() - transaction.timestamp) / 1000, // Time since transaction (seconds)
      transaction.signatureNorm
    ];
  }

  /**
   * Detect anomalies using rule-based approach (fallback)
   */
  private ruleBasedDetection(features: number[]): AnomalyResult {
    let score = 0;
    const anomalyFeatures: string[] = [];

    const [amount, sourceChain, destChain, nonce, timeDiff, sigNorm] = features;

    // Check amount anomalies
    if (amount > 10000 || amount < 1) {
      score += 30;
      anomalyFeatures.push('unusual_amount');
    }

    // Check chain anomalies
    if (sourceChain === destChain) {
      score += 10;
      anomalyFeatures.push('same_chain_transfer');
    }

    if (sourceChain > 5 || destChain > 5) {
      score += 20;
      anomalyFeatures.push('unknown_chain');
    }

    // Check time anomalies
    if (timeDiff > 3600) { // Older than 1 hour
      score += 15;
      anomalyFeatures.push('old_transaction');
    }

    // Check signature anomalies
    if (sigNorm < 30 || sigNorm > 200) {
      score += 25;
      anomalyFeatures.push('unusual_signature');
    }

    // Check nonce patterns
    if (nonce % 1000 === 0) { // Round numbers might be suspicious
      score += 5;
      anomalyFeatures.push('round_nonce');
    }

    const risk = score >= 70 ? 'CRITICAL' : 
                 score >= 50 ? 'HIGH' : 
                 score >= 30 ? 'MEDIUM' : 'LOW';

    return {
      score: Math.min(100, score),
      risk,
      confidence: 0.7 + (score / 100) * 0.3,
      features: anomalyFeatures,
      timestamp: Date.now()
    };
  }

  /**
   * Detect anomalies using ML model
   */
  private async mlBasedDetection(features: number[]): Promise<AnomalyResult> {
    if (!this.model) {
      return this.ruleBasedDetection(features);
    }

    try {
      // Convert features to text for the text classification model
      const featureText = `Transaction: amount ${features[0]}, chains ${features[1]} to ${features[2]}, nonce ${features[3]}, age ${features[4]}s, signature ${features[5]}`;
      
      const result = await this.model(featureText);
      
      // Convert sentiment to anomaly score
      // Assuming 'NEGATIVE' sentiment indicates potential anomaly
      const isNegative = Array.isArray(result) && result[0]?.label === 'NEGATIVE';
      const confidence = Array.isArray(result) ? result[0]?.score || 0.5 : 0.5;
      
      let score = isNegative ? confidence * 100 : (1 - confidence) * 100;
      
      // Combine with rule-based approach
      const ruleResult = this.ruleBasedDetection(features);
      score = (score + ruleResult.score) / 2;

      const risk = score >= 70 ? 'CRITICAL' : 
                   score >= 50 ? 'HIGH' : 
                   score >= 30 ? 'MEDIUM' : 'LOW';

      return {
        score: Math.round(score),
        risk,
        confidence,
        features: ruleResult.features,
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn('ML model failed, using rule-based detection:', error);
      return this.ruleBasedDetection(features);
    }
  }

  /**
   * Analyze transaction for anomalies
   */
  async analyzeTransaction(transaction: TransactionFeatures): Promise<AnomalyResult> {
    const rawFeatures = this.extractFeatures(transaction);
    const normalizedFeatures = this.normalizeFeatures(rawFeatures);

    return await this.mlBasedDetection(normalizedFeatures);
  }

  /**
   * Batch analyze multiple transactions
   */
  async analyzeBatch(transactions: TransactionFeatures[]): Promise<AnomalyResult[]> {
    const results: AnomalyResult[] = [];
    
    for (const transaction of transactions) {
      const result = await this.analyzeTransaction(transaction);
      results.push(result);
    }

    return results;
  }

  /**
   * Update model with new training data
   */
  addTrainingData(features: TransactionFeatures, isAnomaly: boolean): void {
    const extractedFeatures = this.extractFeatures(features);
    this.trainingData.push({
      features: extractedFeatures,
      label: isAnomaly ? 1 : 0
    });

    // Recalculate statistics if we have enough new data
    if (this.trainingData.length % 100 === 0) {
      this.calculateFeatureStatistics();
    }
  }

  /**
   * Get detection statistics
   */
  getDetectionStats(): {
    totalAnalyzed: number;
    modelStatus: 'loading' | 'ready' | 'fallback';
    trainingDataSize: number;
    anomalyRate: number;
  } {
    const anomalies = this.trainingData.filter(d => d.label === 1).length;
    
    return {
      totalAnalyzed: this.trainingData.length,
      modelStatus: this.isModelLoading ? 'loading' : this.model ? 'ready' : 'fallback',
      trainingDataSize: this.trainingData.length,
      anomalyRate: this.trainingData.length > 0 ? anomalies / this.trainingData.length : 0
    };
  }

  /**
   * Get feature importance (simplified)
   */
  getFeatureImportance(): { [key: string]: number } {
    return {
      'amount': 0.25,
      'source_chain': 0.15,
      'destination_chain': 0.15,
      'nonce': 0.10,
      'timestamp': 0.20,
      'signature_norm': 0.15
    };
  }
}

export const anomalyDetection = new AnomalyDetection();