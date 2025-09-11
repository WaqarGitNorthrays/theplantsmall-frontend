import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markOrderReady } from '../../store/slices/ordersSlice';
import Layout from '../Layout/Layout';
import { Package, Clock, CheckCircle, Bell, Filter } from 'lucide-react';

const DispatcherDashboard = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);
  const shops = useSelector((state) => state.shops.shops);
  const [filter, setFilter] = useState('all');
  const [showNotification, setShowNotification] = useState(false);

  const getShopName = (shopId) => {
    const shop = shops.find(s => s.id === shopId);
    return shop ? shop.name : 'Unknown Shop';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleMarkReady = (orderId) => {
    dispatch(markOrderReady(orderId));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Simulate new order notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const readyOrders = orders.filter(order => order.status === 'ready');

  return (
    <Layout title="Dispatcher Dashboard">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>New order received!</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready Orders</p>
                <p className="text-3xl font-bold text-green-600">{readyOrders.length}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
              </div>
              <Package className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found for the selected filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Order #{order.id}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600">{getShopName(order.shopId)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {order.orderType} order
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Items:</h5>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium">
                              ${(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Ready to Deliver
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 font-medium">
                          ✓ Ready for pickup at {new Date(order.readyAt).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DispatcherDashboard;