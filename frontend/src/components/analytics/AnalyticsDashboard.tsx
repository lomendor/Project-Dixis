'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  analyticsApi,
  SalesAnalytics,
  OrdersAnalytics,
  ProductsAnalytics,
  ProducersAnalytics,
  DashboardSummary,
  formatCurrency,
  formatPercentage,
  getStatusColor
} from '@/lib/api/analytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  sales: SalesAnalytics | null;
  orders: OrdersAnalytics | null;
  products: ProductsAnalytics | null;
  producers: ProducersAnalytics | null;
  summary: DashboardSummary | null;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData>({
    sales: null,
    orders: null,
    products: null,
    producers: null,
    summary: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [salesData, ordersData, productsData, producersData, summaryData] = await Promise.all([
        analyticsApi.getSales(period, 30),
        analyticsApi.getOrders(),
        analyticsApi.getProducts(10),
        analyticsApi.getProducers(),
        analyticsApi.getDashboard(),
      ]);

      setData({
        sales: salesData,
        orders: ordersData,
        products: productsData,
        producers: producersData,
        summary: summaryData,
      });
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = data.sales ? {
    labels: data.sales.data.map(item => item.date),
    datasets: [
      {
        label: 'Sales (€)',
        data: data.sales.data.map(item => item.total_sales),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Orders',
        data: data.sales.data.map(item => item.order_count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  } : null;

  const salesChartOptions = {
    responsive: true,
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Sales Over Time (${period === 'daily' ? 'Daily' : 'Monthly'})`,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Sales (€)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const ordersChartData = data.orders ? {
    labels: Object.keys(data.orders.by_status),
    datasets: [
      {
        data: Object.values(data.orders.by_status),
        backgroundColor: Object.keys(data.orders.by_status).map(status => getStatusColor(status)),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  } : null;

  const ordersChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Orders by Status',
      },
    },
  };

  const productsChartData = data.products ? {
    labels: data.products.top_products.map(product => product.name),
    datasets: [
      {
        label: 'Revenue (€)',
        data: data.products.top_products.map(product => product.total_revenue),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  } : null;

  const productsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Products by Revenue',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (€)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="analytics-dashboard">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" data-testid="analytics-dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadAnalyticsData}
                className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                data-testid="retry-button"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Header with Period Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor sales, orders, and marketplace performance</p>
          </div>
          <div className="flex space-x-2" data-testid="period-toggle">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                period === 'daily'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="daily-button"
            >
              Daily
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                period === 'monthly'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="monthly-button"
            >
              Monthly
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {data.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-testid="kpi-today-sales">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.today.sales)}
              </div>
              <div className="text-sm text-gray-600">Today's Sales</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="kpi-today-orders">
              <div className="text-2xl font-bold text-blue-600">
                {data.summary.today.orders}
              </div>
              <div className="text-sm text-gray-600">Today's Orders</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4" data-testid="kpi-month-growth">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(data.summary.month.sales_growth)}
              </div>
              <div className="text-sm text-gray-600">Monthly Growth</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4" data-testid="kpi-avg-order">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(data.summary.today.average_order_value)}
              </div>
              <div className="text-sm text-gray-600">Avg Order Value</div>
            </div>
          </div>
        )}
      </div>

      {/* Sales Chart */}
      {salesChartData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div data-testid="sales-chart">
            <Line data={salesChartData} options={salesChartOptions} />
          </div>
        </div>
      )}

      {/* Orders and Products Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        {ordersChartData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div data-testid="orders-chart">
              <Pie data={ordersChartData} options={ordersChartOptions} />
            </div>
          </div>
        )}

        {/* Top Products */}
        {productsChartData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div data-testid="products-chart">
              <Bar data={productsChartData} options={productsChartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Producer Performance Table */}
      {data.producers && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Producer Performance</h2>
          <div className="overflow-x-auto" data-testid="producers-table">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.producers.top_producers.map((producer) => (
                  <tr key={producer.id} data-testid={`producer-row-${producer.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {producer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {producer.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {producer.product_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(producer.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {producer.order_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {data.summary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="platform-stats">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{data.summary.totals.users}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{data.summary.totals.producers}</div>
              <div className="text-sm text-gray-600">Producers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{data.summary.totals.products}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.totals.lifetime_revenue)}
              </div>
              <div className="text-sm text-gray-600">Lifetime Revenue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}