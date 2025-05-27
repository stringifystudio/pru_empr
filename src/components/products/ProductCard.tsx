import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const discountedPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

function formatPrice(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
    }).format(value || 0);
}
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={product.thumbnail} 
            alt={product.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          {product.discountPercentage && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {Math.round(product.discountPercentage)}% OFF
            </div>
          )}
          <button
            onClick={(e) => handleAddToCart(e)}
            className={`absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-300 ${
              isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
          <button
            className={`absolute bottom-2 left-2 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-300 ${
              isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={16} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-gray-700 font-medium text-lg mb-1 truncate">{product.title}</h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-500">
              <Star size={16} fill="currentColor" />
              <span className="ml-1 text-sm font-medium">{product.rating}</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-500">{product.brand}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              {discountedPrice ? (
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(discountedPrice)}</span>
                  <span className="ml-2 text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
              )}
            </div>
            
            <span className="text-xs text-gray-500">
              {product.stock > 10 ? 'En stock' : `Solo quedan ${product.stock}`}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
