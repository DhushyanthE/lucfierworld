
export interface DataPoint {
  name: string;
  value: number;
}

export interface ChartProps {
  data: DataPoint[];
  categories: string[];
  index: string;
  colors: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
}
