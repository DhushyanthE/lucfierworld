
import { ReactNode } from "react";

export interface QuerySuggestion {
  text: string;
  icon: ReactNode;
}

export interface ChartData {
  type: 'line' | 'bar' | 'area';
  title: string;
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  color?: string;
}

export interface ChatMessageContent {
  text: string;
  charts?: ChartData[];
}
