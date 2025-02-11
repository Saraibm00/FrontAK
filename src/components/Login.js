import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({updateState}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(process.env.API_BACK+'/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      console.log(response.data.id);
      localStorage.setItem('id', response.data.id);
      updateState(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-indigo-600 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600">¡Bienvenid@!</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-3 rounded-xl hover:bg-indigo-600 transition duration-300 shadow-lg"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-500 font-semibold hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>


  );
};

export default Login;
