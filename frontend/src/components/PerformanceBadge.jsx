import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Clock, Award, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { analyticsService } from '../services/api';

/**
 * Get color class based on score
 */
const getScoreColor = (score) => {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get background color class based on score
 */
const getScoreBgColor = (score) => {
  if (score === null || score === undefined) return 'bg-gray-100';
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-blue-100';
  if (score >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
};

/**
 * Get score label
 */
const getScoreLabel = (score) => {
  if (score === null || score === undefined) return 'Not Rated';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Needs Improvement';
};

/**
 * Seller Performance Badge Component
 * Shows seller's performance score and on-time payment rate
 */
export function SellerPerformanceBadge({ sellerId, showDetails = false, size = 'md', className = '' }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await analyticsService.getSellerMetrics(sellerId);
        setMetrics(response.data);
      } catch (err) {
        console.error('Failed to fetch seller metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [sellerId]);

  if (loading) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error || !metrics || metrics.performanceScore === null) {
    return (
      <div className={`inline-flex items-center space-x-1 text-gray-400 ${className}`}>
        <Star size={size === 'sm' ? 12 : 14} />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>Not Rated</span>
      </div>
    );
  }

  const score = metrics.performanceScore;
  const onTimeRate = metrics.onTimeRate;
  const colorClass = getScoreColor(score);
  const bgColorClass = getScoreBgColor(score);

  // Compact badge (for inline display)
  if (!showDetails) {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full ${bgColorClass} ${className}`}
        title={`Performance Score: ${score}% | On-time: ${onTimeRate || 0}%`}
      >
        <Star size={size === 'sm' ? 10 : 12} className={colorClass} fill="currentColor" />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium ${colorClass}`}>
          {Math.round(score)}
        </span>
      </div>
    );
  }

  // Detailed badge with expandable info
  return (
    <div className={`rounded-lg border ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-3 ${bgColorClass} rounded-lg transition hover:opacity-90`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full ${bgColorClass} flex items-center justify-center`}>
            <Star size={20} className={colorClass} fill="currentColor" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-bold ${colorClass}`}>{Math.round(score)}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <p className={`text-sm ${colorClass}`}>{getScoreLabel(score)}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="p-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>On-time Rate</span>
            </div>
            <span className="font-medium">{onTimeRate ? `${onTimeRate}%` : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp size={14} />
              <span>Invoices Settled</span>
            </div>
            <span className="font-medium">{metrics.totalInvoicesSettled || 0}</span>
          </div>
          {metrics.avgDaysToPayment && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Award size={14} />
                <span>Avg Days to Payment</span>
              </div>
              <span className="font-medium">{Math.round(metrics.avgDaysToPayment)} days</span>
            </div>
          )}
          {metrics.lastMetricsUpdate && (
            <p className="text-xs text-gray-400 pt-2 border-t">
              Updated: {new Date(metrics.lastMetricsUpdate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Buyer Reliability Badge Component
 * Shows buyer's reliability score and on-time payment rate
 */
export function BuyerReliabilityBadge({ buyerId, showDetails = false, size = 'md', className = '' }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!buyerId) {
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await analyticsService.getBuyerMetrics(buyerId);
        setMetrics(response.data);
      } catch (err) {
        console.error('Failed to fetch buyer metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [buyerId]);

  if (loading) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error || !metrics || metrics.reliabilityScore === null) {
    return (
      <div className={`inline-flex items-center space-x-1 text-gray-400 ${className}`}>
        <Award size={size === 'sm' ? 12 : 14} />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>Not Rated</span>
      </div>
    );
  }

  const score = metrics.reliabilityScore;
  const onTimeRate = metrics.onTimePaymentRate;
  const colorClass = getScoreColor(score);
  const bgColorClass = getScoreBgColor(score);

  // Compact badge (for inline display)
  if (!showDetails) {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full ${bgColorClass} ${className}`}
        title={`Reliability Score: ${score}% | On-time: ${onTimeRate || 0}%`}
      >
        <Award size={size === 'sm' ? 10 : 12} className={colorClass} fill="currentColor" />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium ${colorClass}`}>
          {Math.round(score)}
        </span>
      </div>
    );
  }

  // Detailed badge with expandable info
  return (
    <div className={`rounded-lg border ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-3 ${bgColorClass} rounded-lg transition hover:opacity-90`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full ${bgColorClass} flex items-center justify-center`}>
            <Award size={20} className={colorClass} fill="currentColor" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-bold ${colorClass}`}>{Math.round(score)}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <p className={`text-sm ${colorClass}`}>{getScoreLabel(score)} Reliability</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="p-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>On-time Payment Rate</span>
            </div>
            <span className="font-medium">{onTimeRate ? `${Math.round(onTimeRate)}%` : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp size={14} />
              <span>Invoices Paid</span>
            </div>
            <span className="font-medium">{metrics.totalInvoicesPaid || 0}</span>
          </div>
          {metrics.avgDaysToPayment && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <AlertCircle size={14} />
                <span>Avg Days to Payment</span>
              </div>
              <span className="font-medium">{Math.round(metrics.avgDaysToPayment)} days</span>
            </div>
          )}
          {metrics.lastMetricsUpdate && (
            <p className="text-xs text-gray-400 pt-2 border-t">
              Updated: {new Date(metrics.lastMetricsUpdate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Static Performance Score Display (no API call)
 * Use this when you already have the metrics data
 */
export function PerformanceScoreDisplay({ score, label = 'Performance', size = 'md', className = '' }) {
  if (score === null || score === undefined) {
    return (
      <div className={`inline-flex items-center space-x-1 text-gray-400 ${className}`}>
        <Star size={size === 'sm' ? 12 : 14} />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>Not Rated</span>
      </div>
    );
  }

  const colorClass = getScoreColor(score);
  const bgColorClass = getScoreBgColor(score);

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full ${bgColorClass} ${className}`}
      title={`${label}: ${score}%`}
    >
      <Star size={size === 'sm' ? 10 : 12} className={colorClass} fill="currentColor" />
      <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium ${colorClass}`}>
        {Math.round(score)}
      </span>
    </div>
  );
}

export default { SellerPerformanceBadge, BuyerReliabilityBadge, PerformanceScoreDisplay };
