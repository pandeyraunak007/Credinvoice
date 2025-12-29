import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLOR_ARRAY } from './index';

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

const CustomTooltip = ({ active, payload, valueFormat }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.payload.fill }}
        />
        <span className="text-gray-600">{data.name}:</span>
        <span className="font-medium text-gray-900">
          {formatValue(data.value, valueFormat)}
        </span>
        <span className="text-gray-400">
          ({((data.value / data.payload.total) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // Don't show label for very small slices

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AnalyticsPieChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 300,
  valueFormat = 'number',
  showLegend = true,
  showLabels = true,
  innerRadius = 0, // Set > 0 for donut chart
  outerRadius = 100,
  colors = CHART_COLOR_ARRAY,
  centerText = null // For donut charts
}) => {
  // Calculate total for percentage display
  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithTotal}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          label={showLabels ? renderCustomLabel : false}
          labelLine={false}
        >
          {dataWithTotal.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip valueFormat={valueFormat} />} />
        {showLegend && (
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={10}
            formatter={(value, entry) => (
              <span className="text-gray-600 text-sm">{value}</span>
            )}
          />
        )}

        {/* Center text for donut charts */}
        {centerText && innerRadius > 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
          >
            <tspan x="50%" dy="-0.5em" fontSize="14" fill="#6B7280">
              {centerText.label}
            </tspan>
            <tspan x="50%" dy="1.5em" fontSize="20" fontWeight="bold" fill="#111827">
              {centerText.value}
            </tspan>
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsPieChart;
