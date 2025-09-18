/**
 * Enhanced Dashboard Service
 * Centralized dashboard state management and analytics
 */

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'status' | 'workflow' | 'ai' | 'blockchain';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  data: any;
  isVisible: boolean;
  refreshRate: number; // in seconds
  lastUpdated: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DashboardMetrics {
  systemHealth: number;
  performanceScore: number;
  activeWorkflows: number;
  completedTasks: number;
  errorRate: number;
  uptime: number;
}

export interface DashboardState {
  currentLayout: DashboardLayout | null;
  availableLayouts: DashboardLayout[];
  metrics: DashboardMetrics;
  isAutoRefresh: boolean;
  refreshInterval: number;
}

class EnhancedDashboardService {
  private state: DashboardState;
  private listeners: Set<(state: DashboardState) => void> = new Set();
  private refreshTimer: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  constructor() {
    this.state = {
      currentLayout: null,
      availableLayouts: this.getDefaultLayouts(),
      metrics: this.getInitialMetrics(),
      isAutoRefresh: true,
      refreshInterval: 5000
    };

    // Set default layout
    this.state.currentLayout = this.state.availableLayouts[0];
    this.startAutoRefresh();
  }

  /**
   * Subscribe to dashboard state changes
   */
  subscribe(listener: (state: DashboardState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current dashboard state
   */
  getState(): DashboardState {
    return { ...this.state };
  }

  /**
   * Switch to a different layout
   */
  switchLayout(layoutId: string): void {
    const layout = this.state.availableLayouts.find(l => l.id === layoutId);
    if (layout) {
      this.state.currentLayout = layout;
      this.notifyListeners();
    }
  }

  /**
   * Add a new widget to current layout
   */
  addWidget(widget: Omit<DashboardWidget, 'id' | 'lastUpdated'>): void {
    if (!this.state.currentLayout) return;

    const newWidget: DashboardWidget = {
      ...widget,
      id: this.generateWidgetId(),
      lastUpdated: Date.now()
    };

    this.state.currentLayout.widgets.push(newWidget);
    this.state.currentLayout.updatedAt = Date.now();
    this.notifyListeners();
  }

  /**
   * Update widget data
   */
  updateWidget(widgetId: string, data: any): void {
    if (!this.state.currentLayout) return;

    const widget = this.state.currentLayout.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.data = { ...widget.data, ...data };
      widget.lastUpdated = Date.now();
      this.notifyListeners();
    }
  }

  /**
   * Remove widget from current layout
   */
  removeWidget(widgetId: string): void {
    if (!this.state.currentLayout) return;

    this.state.currentLayout.widgets = this.state.currentLayout.widgets.filter(
      w => w.id !== widgetId
    );
    this.state.currentLayout.updatedAt = Date.now();
    this.notifyListeners();
  }

  /**
   * Update widget position
   */
  updateWidgetPosition(widgetId: string, position: DashboardWidget['position']): void {
    if (!this.state.currentLayout) return;

    const widget = this.state.currentLayout.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.position = position;
      this.state.currentLayout.updatedAt = Date.now();
      this.notifyListeners();
    }
  }

  /**
   * Create new custom layout
   */
  createLayout(name: string, widgets: DashboardWidget[] = []): string {
    const newLayout: DashboardLayout = {
      id: this.generateLayoutId(),
      name,
      widgets,
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.state.availableLayouts.push(newLayout);
    this.notifyListeners();
    return newLayout.id;
  }

  /**
   * Delete layout
   */
  deleteLayout(layoutId: string): void {
    if (this.state.availableLayouts.length <= 1) return; // Keep at least one layout

    this.state.availableLayouts = this.state.availableLayouts.filter(
      l => l.id !== layoutId
    );

    // Switch to first available layout if deleted layout was active
    if (this.state.currentLayout?.id === layoutId) {
      this.state.currentLayout = this.state.availableLayouts[0];
    }

    this.notifyListeners();
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh(): void {
    this.state.isAutoRefresh = !this.state.isAutoRefresh;
    
    if (this.state.isAutoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
    
    this.notifyListeners();
  }

  /**
   * Set refresh interval
   */
  setRefreshInterval(intervalMs: number): void {
    this.state.refreshInterval = intervalMs;
    
    if (this.state.isAutoRefresh) {
      this.stopAutoRefresh();
      this.startAutoRefresh();
    }
    
    this.notifyListeners();
  }

  /**
   * Manually refresh all widgets
   */
  async refreshAllWidgets(): Promise<void> {
    if (!this.state.currentLayout) return;

    const promises = this.state.currentLayout.widgets.map(widget => 
      this.refreshWidget(widget)
    );

    await Promise.all(promises);
    this.updateMetrics();
    this.notifyListeners();
  }

  /**
   * Export dashboard configuration
   */
  exportConfiguration(): string {
    return JSON.stringify({
      layouts: this.state.availableLayouts,
      currentLayoutId: this.state.currentLayout?.id,
      settings: {
        isAutoRefresh: this.state.isAutoRefresh,
        refreshInterval: this.state.refreshInterval
      }
    }, null, 2);
  }

  /**
   * Import dashboard configuration
   */
  importConfiguration(configJson: string): void {
    try {
      const config = JSON.parse(configJson);
      
      this.state.availableLayouts = config.layouts || this.getDefaultLayouts();
      this.state.currentLayout = this.state.availableLayouts.find(
        l => l.id === config.currentLayoutId
      ) || this.state.availableLayouts[0];
      
      if (config.settings) {
        this.state.isAutoRefresh = config.settings.isAutoRefresh ?? true;
        this.state.refreshInterval = config.settings.refreshInterval ?? 5000;
      }

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to import dashboard configuration:', error);
    }
  }

  private getDefaultLayouts(): DashboardLayout[] {
    return [
      {
        id: 'default',
        name: 'Default Layout',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        widgets: [
          {
            id: 'system-health',
            type: 'metric',
            title: 'System Health',
            position: { x: 0, y: 0, w: 3, h: 2 },
            data: { value: 98, unit: '%', trend: 'up' },
            isVisible: true,
            refreshRate: 30,
            lastUpdated: Date.now()
          },
          {
            id: 'active-workflows',
            type: 'metric',
            title: 'Active Workflows',
            position: { x: 3, y: 0, w: 3, h: 2 },
            data: { value: 5, unit: 'workflows', trend: 'stable' },
            isVisible: true,
            refreshRate: 10,
            lastUpdated: Date.now()
          },
          {
            id: 'performance-chart',
            type: 'chart',
            title: 'Performance Metrics',
            position: { x: 0, y: 2, w: 6, h: 4 },
            data: { chartType: 'line', timeRange: '1h' },
            isVisible: true,
            refreshRate: 60,
            lastUpdated: Date.now()
          },
          {
            id: 'ai-status',
            type: 'ai',
            title: 'AI System Status',
            position: { x: 6, y: 0, w: 3, h: 3 },
            data: { models: 3, accuracy: 0.94, training: true },
            isVisible: true,
            refreshRate: 20,
            lastUpdated: Date.now()
          },
          {
            id: 'blockchain-network',
            type: 'blockchain',
            title: 'Blockchain Network',
            position: { x: 6, y: 3, w: 3, h: 3 },
            data: { nodes: 150, transactions: 1250, blockHeight: 15847293 },
            isVisible: true,
            refreshRate: 15,
            lastUpdated: Date.now()
          }
        ]
      },
      {
        id: 'ai-focused',
        name: 'AI Focused',
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        widgets: [
          {
            id: 'neural-networks',
            type: 'ai',
            title: 'Neural Networks',
            position: { x: 0, y: 0, w: 4, h: 3 },
            data: { networks: 5, training: 2, inference: 3 },
            isVisible: true,
            refreshRate: 10,
            lastUpdated: Date.now()
          },
          {
            id: 'model-performance',
            type: 'chart',
            title: 'Model Performance',
            position: { x: 4, y: 0, w: 5, h: 3 },
            data: { chartType: 'area', metrics: ['accuracy', 'loss'] },
            isVisible: true,
            refreshRate: 30,
            lastUpdated: Date.now()
          },
          {
            id: 'training-progress',
            type: 'workflow',
            title: 'Training Progress',
            position: { x: 0, y: 3, w: 9, h: 3 },
            data: { currentEpoch: 45, totalEpochs: 100, eta: '2h 15m' },
            isVisible: true,
            refreshRate: 5,
            lastUpdated: Date.now()
          }
        ]
      }
    ];
  }

  private getInitialMetrics(): DashboardMetrics {
    return {
      systemHealth: 98,
      performanceScore: 87,
      activeWorkflows: 5,
      completedTasks: 1247,
      errorRate: 0.02,
      uptime: 0
    };
  }

  private async refreshWidget(widget: DashboardWidget): Promise<void> {
    // Simulate widget data refresh
    switch (widget.type) {
      case 'metric':
        widget.data = {
          ...widget.data,
          value: widget.data.value + (Math.random() - 0.5) * 10,
          lastUpdated: Date.now()
        };
        break;
      case 'ai':
        widget.data = {
          ...widget.data,
          accuracy: Math.min(1, Math.max(0, widget.data.accuracy + (Math.random() - 0.5) * 0.1)),
          lastUpdated: Date.now()
        };
        break;
      case 'blockchain':
        widget.data = {
          ...widget.data,
          transactions: widget.data.transactions + Math.floor(Math.random() * 10),
          nodes: widget.data.nodes + Math.floor((Math.random() - 0.5) * 3),
          lastUpdated: Date.now()
        };
        break;
    }
    
    widget.lastUpdated = Date.now();
  }

  private updateMetrics(): void {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    this.state.metrics = {
      systemHealth: 95 + Math.random() * 5,
      performanceScore: 80 + Math.random() * 15,
      activeWorkflows: Math.floor(Math.random() * 10) + 1,
      completedTasks: this.state.metrics.completedTasks + Math.floor(Math.random() * 5),
      errorRate: Math.random() * 0.05,
      uptime
    };
  }

  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.refreshAllWidgets();
    }, this.state.refreshInterval);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private generateWidgetId(): string {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLayoutId(): string {
    return `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const enhancedDashboardService = new EnhancedDashboardService();