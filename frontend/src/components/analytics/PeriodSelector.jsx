import { Calendar } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

const PeriodSelector = ({
  value = 'month',
  onChange,
  options = PERIOD_OPTIONS,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar size={18} className="text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelector;
export { PERIOD_OPTIONS };
