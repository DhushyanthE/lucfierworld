/**
 * Agentic AI Service
 * 
 * Implements autonomous AI agents for blockchain applications using Q-Learning.
 * Formula: Q(s,a) = Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
 */

export interface AgenticAIMetrics {
  performance: number;
  totalRewards: number;
  episodesCompleted: number;
  learningRate: number;
  explorationRate: number;
}

export interface MarketState {
  price: number;
  volume: number;
  trend: number;        // -1 to 1
  volatility: number;   // 0 to 1
  sentiment: number;    // -1 to 1
}

export interface TradingAction {
  type: 'buy' | 'sell' | 'hold';
  amount: number;
  confidence: number;
}

export interface AgentDecision {
  action: string;
  confidence: number;
  expectedReward: number;
  qValue: number;
}

export class AgenticAIService {
  private qTable: Map<string, Map<string, number>> = new Map();
  private learningRate: number = 0.1;
  private discountFactor: number = 0.9;
  private explorationRate: number = 0.3;
  private explorationDecay: number = 0.995;
  private metrics: AgenticAIMetrics;
  private isInitialized: boolean = false;

  constructor() {
    this.metrics = {
      performance: 0,
      totalRewards: 0,
      episodesCompleted: 0,
      learningRate: this.learningRate,
      explorationRate: this.explorationRate
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize Q-table with basic states and actions
    this.initializeQTable();
    this.isInitialized = true;
    console.log("Agentic AI service initialized with Q-Learning");
  }

  /**
   * Initialize Q-table with state-action pairs
   */
  private initializeQTable(): void {
    const states = this.generateStateSpace();
    const actions = ['buy_small', 'buy_large', 'sell_small', 'sell_large', 'hold'];

    states.forEach(state => {
      const stateKey = this.stateToString(state);
      const actionMap = new Map<string, number>();
      
      actions.forEach(action => {
        actionMap.set(action, Math.random() * 0.1); // Small random initialization
      });
      
      this.qTable.set(stateKey, actionMap);
    });

    console.log(`Initialized Q-table with ${states.length} states and ${actions.length} actions`);
  }

  /**
   * Generate discrete state space for Q-learning
   */
  private generateStateSpace(): MarketState[] {
    const states: MarketState[] = [];
    
    // Discretize continuous state space
    const priceRanges = [0, 0.3, 0.7, 1.0];     // Low, medium, high
    const volumeRanges = [0, 0.3, 0.7, 1.0];
    const trendRanges = [-1, -0.3, 0.3, 1.0];
    const volatilityRanges = [0, 0.3, 0.7, 1.0];
    const sentimentRanges = [-1, -0.3, 0.3, 1.0];

    for (let p = 0; p < priceRanges.length - 1; p++) {
      for (let v = 0; v < volumeRanges.length - 1; v++) {
        for (let t = 0; t < trendRanges.length - 1; t++) {
          for (let vol = 0; vol < volatilityRanges.length - 1; vol++) {
            for (let s = 0; s < sentimentRanges.length - 1; s++) {
              states.push({
                price: (priceRanges[p] + priceRanges[p + 1]) / 2,
                volume: (volumeRanges[v] + volumeRanges[v + 1]) / 2,
                trend: (trendRanges[t] + trendRanges[t + 1]) / 2,
                volatility: (volatilityRanges[vol] + volatilityRanges[vol + 1]) / 2,
                sentiment: (sentimentRanges[s] + sentimentRanges[s + 1]) / 2
              });
            }
          }
        }
      }
    }

    return states;
  }

  /**
   * Convert market state to string key for Q-table lookup
   */
  private stateToString(state: MarketState): string {
    return `${Math.round(state.price * 10)}_${Math.round(state.volume * 10)}_${Math.round((state.trend + 1) * 5)}_${Math.round(state.volatility * 10)}_${Math.round((state.sentiment + 1) * 5)}`;
  }

  /**
   * Convert continuous state to discrete state
   */
  private discretizeState(marketData: number[]): MarketState {
    return {
      price: Math.min(Math.max(marketData[0] || 0, 0), 1),
      volume: Math.min(Math.max(marketData[1] || 0, 0), 1),
      trend: Math.min(Math.max(marketData[2] || 0, -1), 1),
      volatility: Math.min(Math.max(marketData[3] || 0, 0), 1),
      sentiment: Math.min(Math.max(marketData[4] || 0, -1), 1)
    };
  }

  /**
   * Make trading decision using Q-Learning
   */
  async makeDecision(
    marketData: number[], 
    currentPortfolio: number[]
  ): Promise<AgentDecision> {
    if (!this.isInitialized) await this.initialize();

    const state = this.discretizeState(marketData);
    const stateKey = this.stateToString(state);
    
    // Get Q-values for current state
    const qValues = this.qTable.get(stateKey);
    if (!qValues) {
      return {
        action: 'hold',
        confidence: 0.1,
        expectedReward: 0,
        qValue: 0
      };
    }

    // Choose action using ε-greedy policy
    let chosenAction: string;
    let qValue: number;

    if (Math.random() < this.explorationRate) {
      // Explore: choose random action
      const actions = Array.from(qValues.keys());
      chosenAction = actions[Math.floor(Math.random() * actions.length)];
      qValue = qValues.get(chosenAction) || 0;
    } else {
      // Exploit: choose best action
      let bestAction = 'hold';
      let bestQValue = -Infinity;
      
      qValues.forEach((value, action) => {
        if (value > bestQValue) {
          bestQValue = value;
          bestAction = action;
        }
      });
      
      chosenAction = bestAction;
      qValue = bestQValue;
    }

    // Calculate confidence based on Q-value distribution
    const qValueArray = Array.from(qValues.values());
    const maxQ = Math.max(...qValueArray);
    const minQ = Math.min(...qValueArray);
    const confidence = maxQ === minQ ? 0.5 : (qValue - minQ) / (maxQ - minQ);

    return {
      action: chosenAction,
      confidence,
      expectedReward: qValue,
      qValue
    };
  }

  /**
   * Update Q-value based on observed reward
   * Q(s,a) = Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
   */
  async updateQValue(
    previousState: number[],
    action: string,
    reward: number,
    newState: number[]
  ): Promise<void> {
    const prevStateKey = this.stateToString(this.discretizeState(previousState));
    const newStateKey = this.stateToString(this.discretizeState(newState));

    const prevQValues = this.qTable.get(prevStateKey);
    const newQValues = this.qTable.get(newStateKey);

    if (!prevQValues || !newQValues) return;

    // Current Q-value
    const currentQ = prevQValues.get(action) || 0;

    // Maximum Q-value for next state
    const maxNextQ = Math.max(...Array.from(newQValues.values()));

    // Q-learning update
    const newQ = currentQ + this.learningRate * (
      reward + this.discountFactor * maxNextQ - currentQ
    );

    prevQValues.set(action, newQ);
    
    // Update metrics
    this.metrics.totalRewards += reward;
    this.updateExploration();
  }

  /**
   * Simulate trading episode for training
   */
  async trainEpisode(marketHistory: number[][]): Promise<{
    totalReward: number;
    actions: string[];
    finalPortfolio: number;
  }> {
    let totalReward = 0;
    const actions: string[] = [];
    let portfolio = 1000; // Starting capital
    let position = 0;     // Current position

    for (let i = 1; i < marketHistory.length; i++) {
      const currentState = marketHistory[i - 1];
      const nextState = marketHistory[i];
      
      // Make decision
      const decision = await this.makeDecision(currentState, [portfolio, position]);
      actions.push(decision.action);

      // Execute action and calculate reward
      const { reward, newPortfolio, newPosition } = this.executeAction(
        decision.action,
        portfolio,
        position,
        currentState[0], // Current price
        nextState[0]     // Next price
      );

      portfolio = newPortfolio;
      position = newPosition;
      totalReward += reward;

      // Update Q-value
      await this.updateQValue(currentState, decision.action, reward, nextState);
    }

    this.metrics.episodesCompleted++;
    this.metrics.performance = (this.metrics.performance + totalReward) / 2;

    return {
      totalReward,
      actions,
      finalPortfolio: portfolio
    };
  }

  /**
   * Execute trading action and calculate reward
   */
  private executeAction(
    action: string,
    portfolio: number,
    position: number,
    currentPrice: number,
    nextPrice: number
  ): { reward: number; newPortfolio: number; newPosition: number } {
    let newPortfolio = portfolio;
    let newPosition = position;
    let reward = 0;

    const actionAmount = action.includes('large') ? 0.5 : 0.1; // Fraction of portfolio

    switch (action) {
      case 'buy_small':
      case 'buy_large':
        if (portfolio > 0) {
          const buyAmount = portfolio * actionAmount;
          const shares = buyAmount / currentPrice;
          newPortfolio -= buyAmount;
          newPosition += shares;
          // Reward based on price increase
          reward = shares * (nextPrice - currentPrice);
        }
        break;

      case 'sell_small':
      case 'sell_large':
        if (position > 0) {
          const sellShares = position * actionAmount;
          const sellValue = sellShares * currentPrice;
          newPortfolio += sellValue;
          newPosition -= sellShares;
          // Reward is the profit from selling
          reward = sellShares * (currentPrice - nextPrice); // Benefit from selling before price drop
        }
        break;

      case 'hold':
        // Small reward for holding during stable periods
        const priceChange = Math.abs(nextPrice - currentPrice) / currentPrice;
        reward = priceChange < 0.01 ? 0.1 : -0.1; // Reward stability
        break;
    }

    return { reward, newPortfolio, newPosition };
  }

  /**
   * Update exploration rate
   */
  private updateExploration(): void {
    this.explorationRate *= this.explorationDecay;
    this.explorationRate = Math.max(this.explorationRate, 0.01); // Minimum exploration
    this.metrics.explorationRate = this.explorationRate;
  }

  /**
   * Get best action for given state
   */
  async getBestAction(marketData: number[]): Promise<{
    action: string;
    qValue: number;
    alternativeActions: { action: string; qValue: number }[];
  }> {
    const state = this.discretizeState(marketData);
    const stateKey = this.stateToString(state);
    const qValues = this.qTable.get(stateKey);

    if (!qValues) {
      return {
        action: 'hold',
        qValue: 0,
        alternativeActions: []
      };
    }

    // Sort actions by Q-value
    const sortedActions = Array.from(qValues.entries())
      .sort(([, a], [, b]) => b - a);

    return {
      action: sortedActions[0][0],
      qValue: sortedActions[0][1],
      alternativeActions: sortedActions.slice(1).map(([action, qValue]) => ({ action, qValue }))
    };
  }

  /**
   * Export Q-table for analysis
   */
  exportQTable(): Record<string, Record<string, number>> {
    const exported: Record<string, Record<string, number>> = {};
    
    this.qTable.forEach((actions, state) => {
      exported[state] = {};
      actions.forEach((qValue, action) => {
        exported[state][action] = qValue;
      });
    });

    return exported;
  }

  /**
   * Get service metrics
   */
  async getMetrics(): Promise<AgenticAIMetrics> {
    return { ...this.metrics };
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.qTable.clear();
    this.explorationRate = 0.3;
    this.metrics = {
      performance: 0,
      totalRewards: 0,
      episodesCompleted: 0,
      learningRate: this.learningRate,
      explorationRate: this.explorationRate
    };
    this.isInitialized = false;
  }
}