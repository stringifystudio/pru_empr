import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Order, getOrders, getOrderComments } from '../lib/orders';
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
  const [comments, setComments] = useState<{ [key: string]: any[] }>({}); // Almacena comentarios por ID de pedido
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({}); // Estado de carga de comentarios

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

  const toggleComments = async (orderId: string) => {
    if (!comments[orderId]) {
      setLoadingComments((prev) => ({ ...prev, [orderId]: true }));
      try {
        const data = await getOrderComments(orderId);
        setComments((prev) => ({ ...prev, [orderId]: data }));
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [orderId]: false }));
      }
    }
  };

  function formatPrice(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Por favor, inicie sesión para ver sus pedidos</h2>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Acceso
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
        <h1 className="text-2xl font-bold mb-8">Tus pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Aún no hay pedidos</h2>
            <p className="text-gray-500 mb-6">Parece que aún no has realizado ningún pedido.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Empezar a comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Pedido realizado</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID de pedido</p>
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
                            Cantidad: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <Link
                          to={`/product/${item.product_id}`}
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
      <p className="text-sm text-gray-500">Dirección de envío</p>
      <p className="text-sm">
        {order.shipping_address.fullName}, {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
      </p>
    </div>
    <Link
      to={`/order/${order.id}`}
      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
    >
      Ver detalles del pedido
    </Link>
    <button
      onClick={() => toggleComments(order.id)} // Asegúrate de que esta función esté definida
      className="text-sm text-gray-600 hover:underline"
    >
      {comments[order.id] ? 'Ocultar comentarios' : 'Ver comentarios'}
    </button>
  </div>
</div>


                {comments[order.id] && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    {loadingComments[order.id] ? (
                      <p className="text-sm text-gray-500">Cargando comentarios...</p>
                    ) : comments[order.id].length === 0 ? (
                      <p className="text-sm text-gray-500">No hay comentarios para este pedido.</p>
                    ) : (
                      <ul className="space-y-2">
                        {comments[order.id].map((comment) => (
                          <li key={comment.id} className="text-sm text-gray-700 border p-2 rounded">
                            <p>{comment.comment}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
