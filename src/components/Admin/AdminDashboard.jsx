import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../Layout/Layout';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Store, 
  Package, 
  Search,
  RefreshCw,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const shops = useSelector((state) => state.shops.shops || []);
  const orders = useSelector((state) => state.orders.orders || []);
  const salesmen = useSelector((state) => state.salesmen.salesmen || []); // ✅ fixed

  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveData, setLiveData] = useState({
    activeSalesman: 2,
    ordersToday: 15,
    revenue: 450.75,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        activeSalesman: Math.max(1, prev.activeSalesman + (Math.random() > 0.5 ? 1 : -1)),
        ordersToday: prev.ordersToday + Math.floor(Math.random() * 3),
        revenue: prev.revenue + Math.random() * 50,
      }));
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const readyOrders = orders.filter((order) => order.status === 'ready');
  const completedOrders = orders.filter((order) => order.status === 'delivered');

  const filteredOrders = orders.filter((order) => {
    const shopName = shops.find((s) => s.id === order.shopId)?.name || '';
    return (
      shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Real-time Status */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Real-time Operations</h2>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-sm opacity-90">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Salesmen</p>
                  <p className="text-3xl font-bold">
                    {Math.max(1, liveData.activeSalesman)}
                  </p>
                </div>
                <Users className="h-10 w-10 text-green-200" />
              </div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Orders Today</p>
                  <p className="text-3xl font-bold">{liveData.ordersToday}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-200" />
              </div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Revenue Today</p>
                  <p className="text-3xl font-bold">${liveData.revenue.toFixed(0)}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-green-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shops</p>
                <p className="text-2xl font-bold text-purple-600">{shops.length}</p>
              </div>
              <Store className="h-10 w-10 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrders.length}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready Orders</p>
                <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedOrders.length}</p>
              </div>
              <Package className="h-10 w-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Salesman Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Active Salesmen</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {salesmen.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{s.name}</h4>
                      <p className="text-sm text-gray-600">{s.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{s.totalShops}</p>
                      <p className="text-xs text-gray-500">Shops</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{s.totalOrders}</p>
                      <p className="text-xs text-gray-500">Orders</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${s.isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full animate-pulse`}></div>
                      <span className={`text-sm ${s.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                        {s.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">All Orders</h3>
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Shop</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Salesman</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const shop = shops.find((s) => s.id === order.shopId);
                  const salesman = salesmen.find((sm) => sm.id === order.salesmanId); // ✅ fixed
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">#{order.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={shop?.image}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="text-gray-900">{shop?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900">{salesman?.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-green-600">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600 text-sm">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
