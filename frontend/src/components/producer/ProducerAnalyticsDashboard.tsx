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
  producerAnalyticsApi,
  ProducerSalesAnalytics,
  ProducerOrdersAnalytics,
  ProducerProductsAnalytics,
  formatCurrency,
  formatPercentage,
  getStatusColor,
  handleProducerError
} from '@/lib/api/producer-analytics';

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

interface ProducerDashboardData {
  sales: ProducerSalesAnalytics | null;
  orders: ProducerOrdersAnalytics | null;
  products: ProducerProductsAnalytics | null;
}

export default function ProducerAnalyticsDashboard() {
  const [data, setData] = useState<ProducerDashboardData>({
    sales: null,
    orders: null,
    products: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    loadProducerAnalytics();
  }, [period]);

  const loadProducerAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [salesData, ordersData, productsData] = await Promise.all([
        producerAnalyticsApi.getSales(period, 30),
        producerAnalyticsApi.getOrders(),
        producerAnalyticsApi.getProducts(10),
      ]);

      setData({
        sales: salesData,
        orders: ordersData,
        products: productsData,
      });
    } catch (err) {
      console.error('Failed to load producer analytics:', err);
      setError(handleProducerError(err as Error));
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
        text: `Your Product Sales (${period === 'daily' ? 'Daily' : 'Monthly'})`,
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
        text: 'Orders with Your Products by Status',
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
        text: 'Your Top Products by Revenue',
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
      <div className="space-y-6" data-testid="producer-analytics-dashboard">
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
      <div className="space-y-6" data-testid="producer-analytics-dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadProducerAnalytics}
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
    <div className="space-y-6" data-testid="producer-analytics-dashboard">
      {/* Header with Period Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 Your Product Analytics</h1>
            <p className="text-gray-600">Monitor your sales performance and product analytics</p>
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

        {/* Producer KPI Cards */}
        {data.sales && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-testid="kpi-total-revenue">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.sales.summary.total_revenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue ({period})</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="kpi-total-orders">
              <div className="text-2xl font-bold text-blue-600">
                {data.sales.summary.total_orders}
              </div>
              <div className="text-sm text-gray-600">Orders with Your Products</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4" data-testid="kpi-growth">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(data.sales.summary.period_growth)}
              </div>
              <div className="text-sm text-gray-600">Sales Growth</div>
            </div>
          </div>
        )}
      </div>

      {/* Sales Chart */}
      {salesChartData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div data-testid="producer-sales-chart">
            <Line data={salesChartData} options={salesChartOptions} />
          </div>
        </div>
      )}

      {/* Orders and Products Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        {ordersChartData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div data-testid="producer-orders-chart">
              <Pie data={ordersChartData} options={ordersChartOptions} />
            </div>
          </div>
        )}

        {/* Top Products */}
        {productsChartData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div data-testid="producer-products-chart">
              <Bar data={productsChartData} options={productsChartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Product Performance Table */}
      {data.products && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Product Performance</h2>
          <div className="overflow-x-auto" data-testid="producer-products-table">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
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
                {data.products.top_products.map((product) => (
                  <tr key={product.id} data-testid={`producer-product-row-${product.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.total_quantity_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.order_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Summary Stats */}
      {data.products && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Portfolio Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="producer-product-stats">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{data.products.summary.total_products}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.products.summary.active_products}</div>
              <div className="text-sm text-gray-600">Active Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data.products.summary.out_of_stock}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.products.summary.best_seller_name || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Best Seller</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}