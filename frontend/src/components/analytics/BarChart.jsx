import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
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

const AnalyticsBarChart = ({
  data = [],
  xKey = 'name',
  bars = [],
  height = 300,
  valueFormat = 'number',
  showGrid = true,
  showLegend = false,
  layout = 'vertical', // 'vertical' or 'horizontal'
  colorByIndex = false, // Color each bar differently
  barSize = 20,
  stacked = false
}) => {
  // If no bars specified, auto-detect from data keys
  const chartBars = bars.length > 0 ? bars :
    data.length > 0
      ? Object.keys(data[0]).filter(key => key !== xKey).map((key, index) => ({
          dataKey: key,
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          color: CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
        }))
      : [];

  const isHorizontal = layout === 'horizontal';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 20, left: isHorizontal ? 80 : 10, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}

        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => formatValue(value, valueFormat)}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
          </>
        ) : (
          <>
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
          </>
        )}

        <Tooltip content={<CustomTooltip valueFormat={valueFormat} />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
            iconSize={10}
          />
        )}

        {chartBars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            fill={bar.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]}
            barSize={barSize}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          >
            {colorByIndex && data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={CHART_COLOR_ARRAY[idx % CHART_COLOR_ARRAY.length]}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsBarChart;
