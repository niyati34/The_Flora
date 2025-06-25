// Plant recognition utilities and logic
import analytics from "./analytics";

export class PlantRecognition {
  constructor() {
    this.plantDatabase = [
      {
        id: 1,
        name: "Snake Plant",
        scientificName: "Sansevieria trifasciata",
        description: "Low maintenance air purifying plant with upright, sword-like leaves",
        characteristics: ["thick", "upright", "green", "yellow edges", "succulent"],
        care: [
          "Water every 2-3 weeks", 
          "Thrives in low to bright indirect light", 
          "Well-draining soil",
          "Temperature: 60-80°F"
        ],
        price: 399,
        availability: "In Stock",
        image: "/c2.webp",
        confidence: 0.85
      },
      {
        id: 2,
        name: "Peace Lily",
        scientificName: "Spathiphyllum",
        description: "Beautiful flowering plant with glossy dark green leaves",
        characteristics: ["dark green", "glossy", "pointed", "white flowers", "tropical"],
        care: [
          "Water when top inch of soil is dry", 
          "Bright indirect light", 
          "High humidity preferred",
          "Temperature: 65-80°F"
        ],
        price: 499,
        availability: "In Stock",
        image: "/c3.webp",
        confidence: 0.82
      },
      {
        id: 3,
        name: "Fiddle Leaf Fig",
        scientificName: "Ficus lyrata",
        description: "Large, violin-shaped leaves make this a popular statement plant",
        characteristics: ["large", "violin shaped", "glossy", "veined", "tree-like"],
        care: [
          "Water when soil is dry 1-2 inches down", 
          "Bright indirect light", 
          "Wipe leaves regularly",
          "Temperature: 65-75°F"
        ],
        price: 899,
        availability: "In Stock",
        image: "/c5.webp",
        confidence: 0.88
      },
      {
        id: 4,
        name: "Rubber Plant",
        scientificName: "Ficus elastica",
        description: "Easy care plant with thick, glossy leaves",
        characteristics: ["thick", "glossy", "oval", "dark green", "burgundy"],
        care: [
          "Water when topsoil is dry", 
          "Bright indirect light", 
          "Clean leaves monthly",
          "Temperature: 60-80°F"
        ],
        price: 449,
        availability: "In Stock",
        image: "/c9.webp",
        confidence: 0.80
      },
      {
        id: 5,
        name: "Spider Plant",
        scientificName: "Chlorophytum comosum",
        description: "Easy-care plant with long, thin leaves and baby plantlets",
        characteristics: ["thin", "arching", "green", "white stripes", "plantlets"],
        care: [
          "Water regularly but allow to dry between waterings", 
          "Bright indirect light", 
          "Room temperature",
          "Propagates easily from babies"
        ],
        price: 299,
        availability: "In Stock",
        image: "/c8.webp",
        confidence: 0.77
      },
      {
        id: 6,
        name: "Monstera Deliciosa",
        scientificName: "Monstera deliciosa",
        description: "Popular plant with large, split leaves",
        characteristics: ["large", "split", "holes", "heart shaped", "climbing"],
        care: [
          "Water when top inch is dry", 
          "Bright indirect light", 
          "Provide climbing support",
          "Temperature: 65-80°F"
        ],
        price: 699,
        availability: "In Stock",
        image: "/c6.webp",
        confidence: 0.85
      }
    ];
  }

  // Simulate image analysis with basic color and shape detection
  analyzeImage(imageData) {
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        const result = this.mockImageAnalysis(imageData);
        analytics.track("plant_recognition_analysis", {
          plantId: result.id,
          confidence: result.confidence,
          processingTime: Math.random() * 3000 + 1000
        });
        resolve(result);
      }, 2000 + Math.random() * 2000);
    });
  }

  // Mock analysis that randomly selects a plant with varying confidence
  mockImageAnalysis(imageData) {
    // In a real implementation, this would use ML/AI to analyze the image
    const randomIndex = Math.floor(Math.random() * this.plantDatabase.length);
    const selectedPlant = { ...this.plantDatabase[randomIndex] };
    
    // Add some randomness to confidence based on "image quality"
    const baseConfidence = selectedPlant.confidence;
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    selectedPlant.confidence = Math.max(0.6, Math.min(0.95, baseConfidence + variation));
    
    return selectedPlant;
  }

  // Get plant suggestions based on characteristics
  getPlantSuggestions(characteristics) {
    return this.plantDatabase.filter(plant => 
      plant.characteristics.some(char => 
        characteristics.some(inputChar => 
          char.toLowerCase().includes(inputChar.toLowerCase())
        )
      )
    ).sort((a, b) => b.confidence - a.confidence);
  }

  // Get care tips for a specific plant
  getCareGuide(plantId) {
    const plant = this.plantDatabase.find(p => p.id === plantId);
    if (!plant) return null;

    return {
      watering: this.getWateringSchedule(plant),
      lighting: this.getLightingRequirements(plant),
      fertilizing: this.getFertilizingSchedule(plant),
      commonIssues: this.getCommonIssues(plant)
    };
  }

  getWateringSchedule(plant) {
    const schedules = {
      "Snake Plant": "Every 2-3 weeks",
      "Peace Lily": "Weekly, when soil feels dry",
      "Fiddle Leaf Fig": "When top 1-2 inches of soil are dry",
      "Rubber Plant": "When topsoil is dry to touch",
      "Spider Plant": "2-3 times per week",
      "Monstera Deliciosa": "When top inch of soil is dry"
    };
    return schedules[plant.name] || "When soil feels dry to touch";
  }

  getLightingRequirements(plant) {
    const lighting = {
      "Snake Plant": "Low to bright indirect light",
      "Peace Lily": "Bright indirect light, tolerates low light",
      "Fiddle Leaf Fig": "Bright indirect light, no direct sun",
      "Rubber Plant": "Bright indirect light",
      "Spider Plant": "Bright indirect light",
      "Monstera Deliciosa": "Bright indirect light"
    };
    return lighting[plant.name] || "Bright indirect light";
  }

  getFertilizingSchedule(plant) {
    return "Monthly during spring and summer with balanced liquid fertilizer";
  }

  getCommonIssues(plant) {
    const issues = {
      "Snake Plant": ["Overwatering (yellow leaves)", "Root rot"],
      "Peace Lily": ["Brown leaf tips (low humidity)", "Drooping (needs water)"],
      "Fiddle Leaf Fig": ["Brown spots (overwatering)", "Leaf drop (shock/change)"],
      "Rubber Plant": ["Leaf drop (overwatering)", "Pest issues"],
      "Spider Plant": ["Brown tips (water quality)", "Pale leaves (too much light)"],
      "Monstera Deliciosa": ["Yellow leaves (overwatering)", "Small leaves (needs more light)"]
    };
    return issues[plant.name] || ["Monitor watering", "Check for pests"];
  }

  // Health assessment based on image analysis
  assessPlantHealth(imageData) {
    // Mock health assessment
    const healthFactors = [
      { factor: "Leaf Color", status: "Good", score: 85 },
      { factor: "Leaf Shape", status: "Excellent", score: 92 },
      { factor: "Overall Growth", status: "Good", score: 78 },
      { factor: "Signs of Pests", status: "None Detected", score: 100 }
    ];

    const overallScore = healthFactors.reduce((sum, factor) => sum + factor.score, 0) / healthFactors.length;
    
    return {
      overallScore: Math.round(overallScore),
      factors: healthFactors,
      recommendations: this.getHealthRecommendations(overallScore)
    };
  }

  getHealthRecommendations(score) {
    if (score >= 90) {
      return ["Your plant looks very healthy!", "Continue current care routine"];
    } else if (score >= 75) {
      return ["Plant is doing well", "Monitor watering schedule", "Check light conditions"];
    } else if (score >= 60) {
      return ["Some care adjustments needed", "Check for overwatering", "Ensure proper lighting"];
    } else {
      return ["Plant needs attention", "Review care routine", "Consider repotting", "Check for pests"];
    }
  }
}

// Export singleton instance
export const plantRecognition = new PlantRecognition();
