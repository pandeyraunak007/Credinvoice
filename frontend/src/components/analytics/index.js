// Analytics Components Export Barrel
export { default as ChartContainer } from './ChartContainer';
export { default as MetricCard } from './MetricCard';
export { default as PeriodSelector } from './PeriodSelector';
export { default as AnalyticsLineChart } from './LineChart';
export { default as AnalyticsBarChart } from './BarChart';
export { default as AnalyticsPieChart } from './PieChart';
export { default as AnalyticsAreaChart } from './AreaChart';

// Chart color palette
export const CHART_COLORS = {
  primary: '#3B82F6',   // Blue
  success: '#22C55E',   // Green
  warning: '#F59E0B',   // Orange
  danger: '#EF4444',    // Red
  purple: '#8B5CF6',    // Purple
  gray: '#6B7280',      // Gray
  teal: '#14B8A6',      // Teal
  pink: '#EC4899',      // Pink
};

// Color array for charts with multiple series
export const CHART_COLOR_ARRAY = [
  '#3B82F6', '#22C55E', '#F59E0B', '#EF4444',
  '#8B5CF6', '#14B8A6', '#EC4899', '#6B7280'
];
