
/**
 * Project Mariner Data Generator
 * 
 * Responsible for generating realistic ocean exploration data
 */

export interface MarinerDataPoint {
  id: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
    depth: number;
  };
  oceanData: {
    temperature: number;
    salinity: number;
    pressure: number;
    currentSpeed: number;
    currentDirection: number;
  };
  marineLife: {
    speciesDetected: string[];
    biomassIndex: number;
    diversityScore: number;
  };
  navigation: {
    heading: number;
    speed: number;
    batteryLevel: number;
    communicationStrength: number;
  };
}

export class MarinerDataGenerator {
  /**
   * Generate a realistic ocean data point
   */
  public generateOceanDataPoint(): MarinerDataPoint {
    const baseTime = Date.now();
    const variance = () => (Math.random() - 0.5) * 0.1;
    
    return {
      id: `mariner-${baseTime}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: baseTime,
      location: {
        latitude: -45.5 + variance(),
        longitude: 170.2 + variance(),
        depth: 2000 + (Math.random() * 3000) // 2-5km deep
      },
      oceanData: {
        temperature: 2.5 + variance(), // Deep ocean temperature
        salinity: 34.7 + variance(), // Ocean salinity
        pressure: 200 + (Math.random() * 300), // Deep pressure
        currentSpeed: 0.1 + (Math.random() * 0.5), // m/s
        currentDirection: Math.random() * 360 // degrees
      },
      marineLife: {
        speciesDetected: this.generateSpeciesDetection(),
        biomassIndex: Math.random() * 100,
        diversityScore: Math.random() * 10
      },
      navigation: {
        heading: Math.random() * 360,
        speed: 1.5 + (Math.random() * 0.5), // knots
        batteryLevel: 85 + (Math.random() * 15),
        communicationStrength: 70 + (Math.random() * 30)
      }
    };
  }

  /**
   * Generate marine species detection data
   */
  private generateSpeciesDetection(): string[] {
    const species = [
      'Deep-sea Anglerfish',
      'Giant Tube Worms',
      'Vampire Squid',
      'Dumbo Octopus',
      'Barreleye Fish',
      'Deep-sea Jellyfish',
      'Goblin Shark',
      'Sea Pig',
      'Deep-sea Cucumber',
      'Fangtooth Fish'
    ];
    
    const detectedCount = Math.floor(Math.random() * 4) + 1;
    const detected: string[] = [];
    
    for (let i = 0; i < detectedCount; i++) {
      const randomSpecies = species[Math.floor(Math.random() * species.length)];
      if (!detected.includes(randomSpecies)) {
        detected.push(randomSpecies);
      }
    }
    
    return detected;
  }
}
