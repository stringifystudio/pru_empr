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

  const userName = user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  const role = user?.user_metadata?.role; // Suponiendo que el rol viene desde user_metadata

  const isAdmin = role === 'admin';
  const isSeller = role === 'user';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
            <ShoppingCart className="mr-2" />
            <span>MercadoApp</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8 relative">
            <input
              type="text"
              placeholder="Buscar productos..."
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
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="bg-gray-200 p-1 rounded-full" />
                    )}
                  </div>
                  <span className="text-xs mt-1">{firstName}</span>
                </div>

                <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Perfil
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mis Compras
                  </Link>
                  {(isAdmin || isSeller) && (
                    <>
                      <Link to="/admin-panel" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Panel de Administración
                      </Link>
                      <Link to="/product-management" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Gestión de Productos
                      </Link>
                    </>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar sesión
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

          <button onClick={toggleMenu} className="md:hidden text-gray-700">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden flex relative">
          <input
            type="text"
            placeholder="Buscar productos..."
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
            <Link to="/wishlist" className="flex items-center py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              <Heart size={20} className="mr-3" />
              Wishlist
            </Link>
            <Link to="/cart" className="flex items-center py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart size={20} className="mr-3" />
              Cart
              {itemCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                  Perfil
                </Link>
                <Link to="/orders" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                  Mis Compras
                </Link>
                {(isAdmin || isSeller) && (
                  <>
                    <Link to="/admin-panel" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                      Panel de Administración
                    </Link>
                    <Link to="/product-management" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                      Gestión de Productos
                    </Link>
                  </>
                )}
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="py-2 hover:text-blue-600">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
