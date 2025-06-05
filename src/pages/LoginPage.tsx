import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowRight, Mail, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
        render: (elementId: string, options: any) => void;
      };
    };
  }
}

const RECAPTCHA_SITE_KEY = '6Lcm4VYrAAAAAGq90HUbHL7tYClE1pJeqxYiAUGq';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  
  const { login, signup, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.enterprise) {
        window.grecaptcha.enterprise.ready(() => {
          window.grecaptcha.enterprise.render('recaptcha-container', {
            'sitekey': RECAPTCHA_SITE_KEY,
            'callback': (token: string) => {
              setRecaptchaToken(token);
              setIsRecaptchaVerified(true);
            }
          });
        });
      } else {
        console.error('reCAPTCHA is not loaded');
      }
    };

    // Verifica si el script de reCAPTCHA ya está cargado
    if (document.readyState === 'complete') {
      loadRecaptcha();
    } else {
      window.addEventListener('load', loadRecaptcha);
      return () => {
        window.removeEventListener('load', loadRecaptcha);
      };
    }
  }, []);

  useEffect(() => {
    setRecaptchaToken(null);
    setIsRecaptchaVerified(false);
  }, [isLogin, isResetPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isRecaptchaVerified || !recaptchaToken) {
      setError('Por favor, verifica que eres humano.');
      setIsLoading(false);
      return;
    }

    try {
      if (isResetPassword) {
        await resetPassword(email);
        setIsResetPassword(false);
      } else if (isLogin) {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await signup(email, password, { full_name: fullName });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error?.message || 'Error de autenticación. Por favor, verifica tus credenciales.');
    } finally {
      setIsLoading(false);
      setRecaptchaToken(null);
      setIsRecaptchaVerified(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center text-2xl font-bold text-blue-600">
          <ShoppingCart className="mr-2" />
          <span>MercadoApp</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isResetPassword 
            ? 'Restablece tu contraseña'
            : isLogin 
              ? 'Inicia sesión en tu cuenta' 
              : 'Crea una nueva cuenta'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isResetPassword ? (
            <button
              onClick={() => setIsResetPassword(false)}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Volver para iniciar sesión
            </button>
          ) : (
            <>
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {isLogin ? 'Inscribirse' : 'Iniciar sesión'}
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && !isResetPassword && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Dirección de correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {!isResetPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {isLogin && !isResetPassword && (
              <div className="text-sm text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPassword(true);
                    setError(null);
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div id="recaptcha-container" className="flex justify-center"></div>

              <button
                type="submit"
                disabled={isLoading || !isRecaptchaVerified}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {isResetPassword ? (
                      <>
                        <Mail size={16} className="mr-2" />
                        Enviar instrucciones de reinicio
                      </>
                    ) : (
                      <>
                        {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                        <ArrowRight size={16} className="ml-1" />
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setError(null);
                  try {
                    await signInWithGoogle();
                    navigate(from, { replace: true });
                  } catch (error: any) {
                    console.error('Google login error:', error);
                    setError(error?.message || 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Iniciar sesión con Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
