
/**
 * Utilities for generating synthetic training data for quantum models
 */

/**
 * Generate synthetic training data for quantum models
 * @param sampleCount Number of samples to generate
 * @param featureCount Number of features per sample
 * @returns Array of data samples with features and labels
 */
export function generateSyntheticTrainingData(
  sampleCount: number, 
  featureCount: number
): { features: number[], label: number }[] {
  const data = [];
  
  // Generate random weights for a synthetic decision boundary
  const weights = Array(featureCount).fill(0).map(() => Math.random() * 2 - 1);
  const bias = Math.random() * 2 - 1;
  
  for (let i = 0; i < sampleCount; i++) {
    // Generate random feature vector
    const features = Array(featureCount).fill(0).map(() => Math.random() * 2 - 1);
    
    // Calculate synthetic label using the random weights
    const sum = features.reduce((acc, val, idx) => acc + val * weights[idx], bias);
    const label = sum > 0 ? 1 : 0;
    
    data.push({ features, label });
  }
  
  return data;
}
