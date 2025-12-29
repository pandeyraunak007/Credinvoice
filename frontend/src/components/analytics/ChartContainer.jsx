import { Loader2 } from 'lucide-react';

const ChartContainer = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  height = 300,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}

      <div style={{ height: `${height}px` }} className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
