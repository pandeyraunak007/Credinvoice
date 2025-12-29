import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  FileText,
  IndianRupee,
  Percent,
  Clock,
  Building2,
  PieChart as PieChartIcon,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { analyticsService } from '../../services/api';
import {
  ChartContainer,
  MetricCard,
  PeriodSelector,
  AnalyticsLineChart,
  AnalyticsBarChart,
  AnalyticsPieChart,
  CHART_COLORS,
} from '../../components/analytics';

// Format currency in Indian format
const formatCurrency = (value) => {
  if (!value) return '0';
  const num = Number(value);
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} K`;
  return num.toLocaleString('en-IN');
};

const BuyerAnalytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [summary, setSummary] = useState(null);
  const [invoiceTrends, setInvoiceTrends] = useState([]);
  const [discountSavings, setDiscountSavings] = useState([]);
  const [sellerPerformance, setSellerPerformance] = useState([]);
  const [fundingBreakdown, setFundingBreakdown] = useState([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, trendsRes, savingsRes, sellersRes, fundingRes] = await Promise.all([
        analyticsService.getBuyerSummary(period),
        analyticsService.getBuyerInvoiceTrends(period, 'week'),
        analyticsService.getBuyerDiscountSavings(period),
        analyticsService.getBuyerSellerPerformance(period, 5),
        analyticsService.getBuyerFundingBreakdown(period),
      ]);

      setSummary(summaryRes.data);
      setInvoiceTrends(trendsRes.data?.trends || []);
      setDiscountSavings(savingsRes.data?.trends || []);
      setSellerPerformance(sellersRes.data?.sellers || []);
      setFundingBreakdown(fundingRes.data?.breakdown || []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={24} />
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw size={18} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <PeriodSelector value={period} onChange={setPeriod} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Invoices"
            value={summary?.invoices?.total || 0}
            subtitle={`Value: ${formatCurrency(summary?.invoices?.value)}`}
            trend={summary?.invoices?.trend}
            trendLabel="vs prev"
            icon={FileText}
            iconColor="blue"
            loading={loading}
          />
          <MetricCard
            title="Total Savings"
            value={`${formatCurrency(summary?.savings?.total)}`}
            subtitle="From early payments"
            trend={summary?.savings?.trend}
            trendLabel="vs prev"
            icon={IndianRupee}
            iconColor="green"
            loading={loading}
          />
          <MetricCard
            title="Avg Discount Rate"
            value={`${summary?.savings?.avgRate?.toFixed(1) || 0}%`}
            subtitle="On accepted invoices"
            icon={Percent}
            iconColor="purple"
            loading={loading}
          />
          <MetricCard
            title="Pending Payments"
            value={summary?.payments?.pending || 0}
            subtitle={`Amount: ${formatCurrency(summary?.payments?.amount)}`}
            icon={Clock}
            iconColor="orange"
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Trends */}
          <ChartContainer
            title="Invoice Trends"
            subtitle="Volume and value over time"
            loading={loading}
            height={300}
          >
            <AnalyticsLineChart
              data={invoiceTrends.map((t) => ({
                date: t.date,
                count: t.count,
                value: t.value,
              }))}
              xKey="date"
              lines={[
                { dataKey: 'count', name: 'Invoices', color: CHART_COLORS.primary },
                { dataKey: 'value', name: 'Value', color: CHART_COLORS.success },
              ]}
              valueFormat="number"
              height={260}
            />
          </ChartContainer>

          {/* Discount Savings */}
          <ChartContainer
            title="Discount Savings"
            subtitle="Monthly savings from early payments"
            loading={loading}
            height={300}
          >
            <AnalyticsBarChart
              data={discountSavings.map((d) => ({
                month: d.date,
                savings: d.savings,
              }))}
              xKey="month"
              bars={[{ dataKey: 'savings', name: 'Savings', color: CHART_COLORS.success }]}
              valueFormat="currency"
              height={260}
            />
          </ChartContainer>

          {/* Top Sellers */}
          <ChartContainer
            title="Top Sellers"
            subtitle="By invoice volume"
            loading={loading}
            height={300}
          >
            <AnalyticsBarChart
              data={sellerPerformance.map((s) => ({
                name: s.name?.substring(0, 15) || 'Unknown',
                value: Number(s.totalValue) || 0,
              }))}
              xKey="name"
              bars={[{ dataKey: 'value', name: 'Total Value', color: CHART_COLORS.purple }]}
              layout="horizontal"
              valueFormat="currency"
              colorByIndex={true}
              height={260}
            />
          </ChartContainer>

          {/* Funding Breakdown */}
          <ChartContainer
            title="Funding Breakdown"
            subtitle="Self-funded vs Financier-funded"
            loading={loading}
            height={300}
          >
            {fundingBreakdown.length > 0 ? (
              <AnalyticsPieChart
                data={fundingBreakdown.map((f) => ({
                  name: f.name,
                  value: Number(f.value) || 0,
                }))}
                nameKey="name"
                valueKey="value"
                valueFormat="currency"
                innerRadius={60}
                outerRadius={100}
                height={260}
                colors={[CHART_COLORS.primary, CHART_COLORS.purple]}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No funding data available
              </div>
            )}
          </ChartContainer>
        </div>

        {/* Summary Stats */}
        {summary?.funding && Object.keys(summary.funding).length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(summary.funding).map(([type, data]) => (
                <div
                  key={type}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      type === 'SELF_FUNDED' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}
                  >
                    {type === 'SELF_FUNDED' ? (
                      <IndianRupee
                        className={type === 'SELF_FUNDED' ? 'text-blue-600' : 'text-purple-600'}
                        size={24}
                      />
                    ) : (
                      <Building2 className="text-purple-600" size={24} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {type === 'SELF_FUNDED' ? 'Self Funded' : 'Financier Funded'}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {data.count} invoices
                    </p>
                    <p className="text-sm text-gray-500">
                      Value: {formatCurrency(data.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerAnalytics;
