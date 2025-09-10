
export interface ChartSegment {
  label: string;
  value: number;
  color: string;
}

export interface TokenChartProps {
  data: ChartSegment[];
  title: string;
  height?: number;
  rotationSpeed?: number;
}
