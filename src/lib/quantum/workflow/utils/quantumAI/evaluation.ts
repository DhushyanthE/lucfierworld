
/**
 * Quantum AI model evaluation functionality
 */

import { QuantumAIModel, QuantumEvaluationConfig, QuantumEvaluationResult } from './types';
import { quantumForwardPass } from './inference';

/**
 * Evaluate a quantum AI model on test data
 */
export function evaluateQuantumModel(
  model: QuantumAIModel,
  testData: { input: number[], output: number[] }[],
  config: QuantumEvaluationConfig
): QuantumEvaluationResult {
  console.log(`Evaluating quantum model on ${testData.length} examples`);
  
  // Initialize confusion matrix if needed
  let confusionMatrix: number[][] | undefined;
  
  if (config.confusionMatrix) {
    // Determine number of classes from first example
    const numClasses = testData[0].output.length;
    confusionMatrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));
  }
  
  // Counters for metrics
  let correct = 0;
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  // Process each test example
  for (const example of testData) {
    // Forward pass through the model
    const result = quantumForwardPass(model, example.input);
    
    // Get predicted class (index of maximum output)
    const predictedClass = result.output.indexOf(Math.max(...result.output));
    const trueClass = example.output.indexOf(Math.max(...example.output));
    
    // Update metrics
    if (predictedClass === trueClass) {
      correct++;
      truePositives++;
    } else {
      falsePositives++;
      falseNegatives++;
    }
    
    // Update confusion matrix if enabled
    if (confusionMatrix) {
      confusionMatrix[trueClass][predictedClass]++;
    }
  }
  
  // Calculate metrics
  const accuracy = correct / testData.length;
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = 2 * ((precision * recall) / (precision + recall)) || 0;
  
  // Calculate quantum advantage (simulated)
  const quantumAdvantage = config.useQuantumEnhancement ? 
    model.coherenceScore && model.fidelity ? 
      (model.coherenceScore * model.fidelity) * 1.5 : 1.2 
    : 1.0;
  
  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix,
    quantumAdvantage
  };
}

/**
 * Generate feature importance scores
 */
export function calculateFeatureImportance(
  model: QuantumAIModel,
  testData: { input: number[], output: number[] }[]
): number[] {
  // Initialize importance scores for each input feature
  const importanceScores = Array(model.layers[0]).fill(0);
  
  // For each feature, measure the effect of permuting its values
  for (let featureIndex = 0; featureIndex < model.layers[0]; featureIndex++) {
    // First, calculate the baseline accuracy
    const baselineAccuracy = evaluateQuantumModel(
      model, 
      testData,
      { useQuantumEnhancement: true, metricTypes: ['accuracy'], confusionMatrix: false }
    ).accuracy;
    
    // Create a copy of the test data with this feature permuted
    const permutedData = testData.map(example => {
      const permutedExample = { ...example, input: [...example.input] };
      
      // Replace this feature with a random value from another example
      const randomExample = testData[Math.floor(Math.random() * testData.length)];
      permutedExample.input[featureIndex] = randomExample.input[featureIndex];
      
      return permutedExample;
    });
    
    // Calculate accuracy with permuted feature
    const permutedAccuracy = evaluateQuantumModel(
      model, 
      permutedData,
      { useQuantumEnhancement: true, metricTypes: ['accuracy'], confusionMatrix: false }
    ).accuracy;
    
    // Importance is the drop in accuracy
    importanceScores[featureIndex] = baselineAccuracy - permutedAccuracy;
  }
  
  return importanceScores;
}
