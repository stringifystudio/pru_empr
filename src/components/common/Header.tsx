import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-blue-600 flex items-center"
          >
            <ShoppingCart className="mr-2" />
            <span>MercadoApp</span>
          </Link>

          {/* Search Bar - Hidden on mobile, visible on larger screens */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 mx-8 relative"
          >
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-4 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              <Search size={20} />
            </button>
          </form>

          {/* Navigation Icons - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 transition-colors">
              <div className="flex flex-col items-center">
                <Heart size={20} />
                <span className="text-xs mt-1">Wishlist</span>
              </div>
            </Link>
            
            <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors relative">
              <div className="flex flex-col items-center">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
                <span className="text-xs mt-1">Cart</span>
              </div>
            </Link>
            
            {isAuthenticated ? (
              <div className="relative group">
                <div className="flex flex-col items-center cursor-pointer">
                  <div className="w-7 h-7 rounded-full overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="bg-gray-200 p-1 rounded-full" />
                    )}
                  </div>
                  <span className="text-xs mt-1">{user?.name.split(' ')[0]}</span>
                </div>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</Link>
                  {user?.isSeller && (
                    <Link to="/seller-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Seller Dashboard</Link>
                  )}
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                <div className="flex flex-col items-center">
                  <User size={20} />
                  <span className="text-xs mt-1">Login</span>
                </div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="mt-3 md:hidden flex relative"
        >
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition-colors"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-3">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link 
              to="/wishlist" 
              className="flex items-center py-2 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart size={20} className="mr-3" />
              <span>Wishlist</span>
            </Link>
            
            <Link 
              to="/cart" 
              className="flex items-center py-2 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart size={20} className="mr-3" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center py-2 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={20} className="mr-3" />
                  <span>Profile</span>
                </Link>
                <Link 
                  to="/orders" 
                  className="flex items-center py-2 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="ml-7">Orders</span>
                </Link>
                {user?.isSeller && (
                  <Link 
                    to="/seller-dashboard" 
                    className="flex items-center py-2 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="ml-7">Seller Dashboard</span>
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center py-2 hover:text-blue-600 transition-colors"
                >
                  <span className="ml-7">Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center py-2 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} className="mr-3" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;