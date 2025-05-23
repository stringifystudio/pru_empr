import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Order } from '../lib/orders';
import { getOrders } from '../lib/orders';
import { useAuth } from '../context/AuthContext';

const OrderStatusIcon = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'pending':
      return <Clock className="text-yellow-500" />;
    case 'processing':
      return <Package className="text-blue-500" />;
    case 'shipped':
      return <Truck className="text-purple-500" />;
    case 'delivered':
      return <CheckCircle className="text-green-500" />;
    case 'cancelled':
      return <XCircle className="text-red-500" />;
    default:
      return null;
  }
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your orders</h2>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order placed</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-medium">{order.id}</p>
                    </div>
                    <div className="flex items-center">
                      <OrderStatusIcon status={order.status} />
                      <span className="ml-2 capitalize">{order.status}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={item.product?.thumbnail}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{item.product?.title}</h3>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="text-sm">
                        {order.shippingAddress.fullName}, {order.shippingAddress.address},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                        {order.shippingAddress.zipCode}
                      </p>
                    </div>
                    <Link
                      to={`/order/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Order Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
