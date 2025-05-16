import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (error) {
      setMessage('Error al cambiar la contraseña: ' + error.message);
    } else {
      setMessage('¡Contraseña actualizada exitosamente!');
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="max-w-sm mx-auto p-4">
      <h2 className="text-xl mb-4">Cambiar Contraseña</h2>

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="block w-full p-2 mb-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        className="block w-full p-2 mb-4 border rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </form>
  );
}
