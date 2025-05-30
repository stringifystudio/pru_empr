import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, User, Settings, ShoppingBag, CreditCard, Bell, Shield, LogOut, PlusCircle, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Por favor, inicia sesión para ver tu perfil</h2>
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

  const fullName = user.user_metadata?.full_name || 'N/A';
  const email = user.email || 'No hay correo electrónico disponible';
  const phone = user.phone || 'Sin número de teléfono';
  const isAdmin = userRole === 'admin';

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'orders', label: 'Órdenes', icon: ShoppingBag },
    ...(isAdmin ? [
      { id: 'admin-orders', label: 'Pedidos', icon: ShoppingBag },
      { id: 'create-product', label: 'Crear producto', icon: PlusCircle },
      { id: 'edit-product', label: 'Editar productos', icon: Edit }
    ] : []),
    { id: 'payment', label: 'Métodos de pago', icon: CreditCard },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100 overflow-hidden bg-gray-200">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User  className="w-full h-full p-4 text-gray-400" />
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{fullName}</h2>
                  <p className="text-gray-500 text-sm">{email}</p>
                  {isAdmin && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                      Admin
                    </span>
                  )}
                </div>

                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} className="mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} className="mr-3" />
                    Cerrar sesión
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:w-3/4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Información de perfil</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección de correo electrónico
                        </label>
                        <input
                          type="email"
                          value={email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de teléfono
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          readOnly
                        />
                      </div>
                      <div className="pt-4">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          Editar perfil
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Tus pedidos</h3>
                    <Link
                      to="/orders"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Ver todos los pedidos
                    </Link>
                  </div>
                )}

                {activeTab === 'admin-orders' && isAdmin && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Gestión de Pedidos</h3>
                    <Link
                      to="/admin/orders"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Ver todos los pedidos
                    </Link>
                  </div>
                )}

                {activeTab === 'create-product' && isAdmin && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Crear nuevo producto</h3>
                    <Link
                      to="/admin/create-product"
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Crear nuevo producto
                    </Link>
                  </div>
                )}

                {activeTab === 'edit-product' && isAdmin && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Editar productos</h3>
                    <Link
                      to="/admin/edit-product"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Edit size={18} className="mr-2" />
                      Administrar productos
                    </Link>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Métodos de pago</h3>
                    <p className="text-gray-500">Aún no se han añadido métodos de pago.</p>
                    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Agregar método de pago
                    </button>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Preferencias de notificación</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Actualizaciones de pedidos</h4>
                          <p className="text-sm text-gray-500">
                            Recibe notificaciones sobre el estado de tu pedido
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Promociones</h4>
                          <p className="text-sm text-gray-500">
                            Recibe notificaciones sobre ofertas y promociones
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Configuración de seguridad</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Cambiar la contraseña</h4>
                        <Link
                          to="/update-password"
                          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
                        >
                          Actualizar contraseña
                        </Link>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Autenticación de dos factores</h4>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
                          Habilitar 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Configuraciones de la cuenta</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Language</h4>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Moneda</h4>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                          <option value="gbp">GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Eliminar cuenta</h4>
                        <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                          Eliminar cuenta
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
