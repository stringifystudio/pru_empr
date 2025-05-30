import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);
}

const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tu lista de deseos está vacía</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-8">Mi Lista de Deseos</h1>
        <div className="grid gap-6">
          {wishlist.map((product) => (
            <div key={product.id} className="flex items-center justify-between bg-white p-4 shadow rounded">
              <div className="flex items-center space-x-4">
                {product.image && (
                  <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <h2 className="font-semibold">{product.title}</h2>
                  <p className="text-gray-600">{formatPrice(product.price)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Ver
                </button>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
