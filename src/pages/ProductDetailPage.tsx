import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, ChevronRight, Truck, ArrowLeft } from 'lucide-react';
import { Product, Review } from '../types';
import { products, reviews } from '../data/mockData';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // In a real app, you would fetch the product from an API
    // For now, use our mock data
    if (id) {
      const foundProduct = products.find((p) => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedImage(foundProduct.thumbnail);
        
        // Get related products based on category
        const related = products
          .filter((p) => p.category === foundProduct.category && p.id !== id)
          .slice(0, 4);
        setRelatedProducts(related);
        
        // Get reviews for this product
        const productReviews = reviews[id] || [];
        setProductReviews(productReviews);
      }
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Add the product to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
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
            <span>Back</span>
          </button>
          <ChevronRight size={16} className="mx-2" />
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
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
                {product.images.map((image, index) => (
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
                      className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                    />
                  ))}
                  <span className="ml-2 text-gray-600 text-sm">{product.rating} ({productReviews.length} reviews)</span>
                </div>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-green-600 text-sm font-medium">
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>
              
              <div className="mb-6">
                {discountedPrice ? (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-gray-900">${discountedPrice.toFixed(2)}</span>
                    <span className="ml-2 text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                    <span className="ml-2 bg-red-100 text-red-700 text-sm px-2 py-1 rounded">
                      Save {Math.round(product.discountPercentage)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Truck className="mr-2 text-blue-600" size={18} />
                  <p>Free shipping on orders over $50</p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[...Array(10)].map((_, i) => (
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
                    Add to Cart
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
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <img
                    src={`https://i.pravatar.cc/150?img=${parseInt(product.seller.id)}`}
                    alt={product.seller.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Sold by: {product.seller.name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex items-center text-yellow-400">
                        <Star size={14} fill="currentColor" />
                        <span className="ml-1">{product.seller.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'description' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'specs' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('specs')}
              >
                Specifications
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({productReviews.length})
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget ultricies nisl nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget ultricies aliquam, nunc nisl aliquet nunc, eget ultricies nisl nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget ultricies.
                  </p>
                </div>
              )}
              
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Product Specifications</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center justify-between">
                        <span className="text-gray-500">Brand</span>
                        <span>{product.brand}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-500">Category</span>
                        <span>{product.category}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-500">In Stock</span>
                        <span>{product.stock}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Shipping Information</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span>Free over $50</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-500">Estimated delivery</span>
                        <span>2-5 business days</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-500">Return policy</span>
                        <span>30 days</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Customer Reviews</h3>
                  
                  {productReviews.length > 0 ? (
                    <div className="space-y-6">
                      {productReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center mb-2">
                            <img
                              src={review.userAvatar || `https://i.pravatar.cc/150?img=${review.id}`}
                              alt={review.userName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{review.userName}</p>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  )}
                  
                  <button className="mt-6 bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;