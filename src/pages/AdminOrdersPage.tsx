import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Order, getOrders, updateOrderStatus, createOrderComment } from '../lib/orders';
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

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [orderId: string]: string }>({});
  const [statuses, setStatuses] = useState<{ [orderId: string]: string }>({}); // Nuevo estado para almacenar el estado seleccionado
  const { user, userRole } = useAuth(); // Obtén el usuario y su rol

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError('Error al cargar los pedidos');
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'admin') {
      loadOrders();
    }
  }, [userRole]);

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Acceso denegado</h2>
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

  function formatPrice(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setStatuses((prev) => ({ ...prev, [orderId]: newStatus })); // Actualiza el estado seleccionado
    console.log('Updating order ID:', orderId, 'to status:', newStatus);
    try {
      updateOrderStatus(orderId, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('No se pudo actualizar el estado del pedido.');
    }
  };

  const handleCommentChange = (orderId: string, value: string) => {
    setComments((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleCommentSubmit = async (orderId: string) => {
    const comment = comments[orderId];
    const newStatus = statuses[orderId] || ''; // Obtiene el estado seleccionado
    if (!comment || comment.trim() === '') {
      alert('El comentario no puede estar vacío.');
      return;
    }
    try {
      await createOrderComment(orderId, comment, user?.id, newStatus); // Pasa el nuevo estado
      alert('Comentario guardado exitosamente.');
      setComments((prev) => ({ ...prev, [orderId]: '' })); // Limpia el textarea
    } catch (err) {
      console.error('Error saving comment:', err);
      alert('Error guardando el comentario.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Gestión de Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Aún no hay pedidos</h2>
            <p className="text-gray-500 mb-6">Parece que aún no se han realizado pedidos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold mb-4">Detalles del Pedido</h2>
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

                  <h3 className="text-lg font-semibold mb-2">Artículos</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center border-b border-gray-300 pb-2 mb-2">
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
                  <h3 className="text-lg font-semibold mb-2">Dirección de envío</h3>
                  <p className="text-sm text-gray-500">
                    {order.shipping_address.fullName}, {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                  </p>
                </div>

                {/* Sección para cambiar el estado y dejar comentarios */}
                <div className="p-4 bg-gray-100">
                  <h4 className="font-medium mb-2">Actualizar estado del pedido</h4>
                  <select
                    value={statuses[order.id] || order.status} // Muestra el estado actual o el seleccionado
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="border border-gray-300 rounded-md p-2"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="processing">En proceso</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>

                  <h4 className="font-medium mt-4 mb-2">Comentarios</h4>
                  <textarea
                    rows={3}
                    placeholder="Deja un comentario sobre el pedido..."
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={comments[order.id] || ''} // Muestra el comentario actual
                    onChange={(e) => handleCommentChange(order.id, e.target.value)} // Captura el comentario
                  />
                  <button
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => handleCommentSubmit(order.id)} // Envía el comentario
                  >
                    Guardar comentario
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
