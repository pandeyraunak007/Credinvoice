import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CHART_COLORS, CHART_COLOR_ARRAY } from './index';

const formatValue = (value, format) => {
  if (format === 'currency') {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)} L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
    return value.toLocaleString('en-IN');
  }
  if (format === 'percentage') return `${value}%`;
  return value.toLocaleString('en-IN');
};

const CustomTooltip = ({ active, payload, label, valueFormat }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-900">
            {formatValue(entry.value, valueFormat)}
          </span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsAreaChart = ({
  data = [],
  xKey = 'name',
  areas = [],
  height = 300,
  valueFormat = 'number',
  showGrid = true,
  showLegend = true,
  stacked = false,
  gradientOpacity = 0.3
}) => {
  // If no areas specified, auto-detect from data keys
  const chartAreas = areas.length > 0 ? areas :
    data.length > 0
      ? Object.keys(data[0]).filter(key => key !== xKey).map((key, index) => ({
          dataKey: key,
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          color: CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
        }))
      : [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          {chartAreas.map((area, index) => {
            const color = area.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length];
            return (
              <linearGradient
                key={`gradient-${area.dataKey}`}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={gradientOpacity} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>

        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatValue(value, valueFormat)}
        />
        <Tooltip content={<CustomTooltip valueFormat={valueFormat} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
            iconSize={10}
          />
        )}

        {chartAreas.map((area, index) => {
          const color = area.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length];
          return (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${area.dataKey})`}
              stackId={stacked ? 'stack' : undefined}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsAreaChart;
