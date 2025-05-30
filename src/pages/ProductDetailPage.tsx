import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, ChevronRight, Truck, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext'; // Importar el contexto de autenticación
import toast from 'react-hot-toast'; // Importar la librería de notificaciones

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Obtener la función para agregar al carrito
  const { user, isAuthenticated } = useAuth(); // Obtener el usuario del contexto de autenticación
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); // Para almacenar las reseñas
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' }); // Para el nuevo comentario

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;

        // Fetch main product by id
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        // Normalize images field: if no images array, fallback to thumbnail
        const imagesArray = productData.images
          ? Array.isArray(productData.images) 
            ? productData.images 
            : [productData.images] 
          : productData.thumbnail 
            ? [productData.thumbnail] 
            : [];

        const formattedProduct: Product = {
          ...productData,
          images: imagesArray,
          thumbnail: productData.thumbnail || imagesArray[0] || ''
        };

        setProduct(formattedProduct);
        setSelectedImage(formattedProduct.images[0] || '');

        // Fetch related products only if category exists
        if (formattedProduct.category) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', formattedProduct.category)
            .neq('id', id)
            .limit(4);

          if (!relatedError && relatedData) {
            setRelatedProducts(relatedData);
          }
        }

        // Fetch reviews for the product
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id);

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Calcular el rating promedio
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0; // Si no hay reseñas, el promedio es 0

  // Agregar al carrito con cantidad
  const handleAddToCart = () => {
    if (product && quantity > 0 && product.stock >= quantity) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    if (val > 0 && product && val <= product.stock) {
      setQuantity(val);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment || !isAuthenticated) {
      toast.error('Debes estar autenticado para enviar una reseña');
      return; // Asegúrate de que el usuario esté autenticado
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{ 
          product_id: id, 
          user_name: user?.user_metadata.full_name || 'Usuario Anónimo', // Obtener el nombre del usuario
          user_photo: user?.user_metadata.avatar_url || '', // Obtener la foto del usuario
          rating: newReview.rating, 
          comment: newReview.comment 
        }]);

      if (error) throw error;

      // Actualizar la lista de reseñas
      setReviews(prev => [...prev, { ...newReview, user_name: user?.user_metadata.full_name || 'Usuario Anónimo', user_photo: user?.user_metadata.avatar_url || '' }]);
      setNewReview({ rating: 5, comment: '' }); // Resetear el formulario
      toast.success('Reseña enviada con éxito');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al enviar la reseña');
    }
  };

  function formatPrice(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
    }).format(value || 0);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product not found'}
          </h2>
          <button
            onClick={handleGoBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <button onClick={handleGoBack} className="flex items-center hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            <span>Volver</span>
          </button>
          <ChevronRight size={16} className="mx-2" />
          <a href="/" className="hover:text-blue-600 transition-colors">Inicio</a>
          <ChevronRight size={16} className="mx-2" />
          <a href={`/category/${product.category}`} className="hover:text-blue-600 transition-colors">{product.category}</a>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-700 font-medium truncate">{product.title}</span>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Images */}
            <div className="p-6 border-r border-gray-200">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img 
                  src={selectedImage} 
                  alt={product.title} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {(product.images || []).map((image, index) => (
                  <div 
                    key={index}
                    className={`aspect-square rounded border-2 cursor-pointer ${
                      selectedImage === image 
                        ? 'border-blue-600' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} - view ${index + 1}`} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                    />
                  ))}
                  <span className="ml-2 text-gray-600 text-sm">{averageRating.toFixed(1)}</span>
                </div>
                <span className="mx-2 text-gray-300">|</span>
                <span className={`text-sm font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>
              
              <div className="mb-6">
                {discountedPrice ? (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(discountedPrice)}</span>
                    <span className="ml-2 text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
                    <span className="ml-2 bg-red-100 text-red-700 text-sm px-2 py-1 rounded">
                      Save {Math.round(product.discountPercentage)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Truck className="mr-2 text-blue-600" size={18} />
                  <p>Envío gratuito en pedidos superiores a $50</p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[...Array(Math.min(10, product.stock))].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="mr-2" size={20} />
                    añadir al carrito
                  </button>
                  <button
                    className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <Heart size={20} />
                  </button>
                  <button
                    className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
                  <p>Vendido por: <strong>{product.seller.name}</strong></p>
                  <a
                    href={`/seller/${product.seller.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver perfil de vendedor
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Reseñas</h2>
          <form onSubmit={handleSubmitReview} className="mb-6">
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  className={newReview.rating >= star ? 'text-yellow-400 fill-current cursor-pointer' : 'text-gray-300 cursor-pointer'}
                  onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                />
              ))}
            </div>
            <textarea
              name="comment"
              value={newReview.comment}
              onChange={handleReviewChange}
              placeholder="Escribe tu reseña aquí..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              rows={4}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Enviar Reseña
            </button>
          </form>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 py-4">
                <div className="flex items-center mb-2">
                  <img src={review.user_photo || '/default-avatar.png'} alt={review.user_name} className="w-8 h-8 rounded-full mr-2" />
                  <span className="font-semibold">{review.user_name}</span>
                  <div className="flex ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No hay reseñas para este producto.</p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
