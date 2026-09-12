import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
  const iniciarSesion = useAuthStore(state => state.iniciarSesion);
  const modoMantenimiento = useAuthStore(state => state.modoMantenimiento);
  const mensajeMantenimiento = useAuthStore(state => state.mensajeMantenimiento);
  
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!correo || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }

    const resultado = iniciarSesion(correo, password);
    
    if (!resultado.exito) {
      if (resultado.mensaje === 'Mantenimiento') {
        setError('El sistema está en mantenimiento. Solo administradores pueden acceder.');
      } else {
        setError(resultado.mensaje);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/presupro-logo.png" alt="PresuPro" className="h-20 object-contain drop-shadow-2xl" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          PresuPro
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-semibold tracking-wide uppercase">
          Módulo de Compras
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-700">
          
          {modoMantenimiento && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <span className="text-amber-500 text-xl">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-amber-500">Modo Mantenimiento Activo</h3>
                <p className="text-xs text-amber-400/80 mt-1">{mensajeMantenimiento}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-600 bg-slate-900/50 rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="ejemplo@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-600 bg-slate-900/50 rounded-xl shadow-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-500">
                  Credenciales de prueba
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-center text-slate-400">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                <p className="font-bold text-slate-300">ADMIN</p>
                <p>admin@empresa.com</p>
                <p>Pass: admin</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                <p className="font-bold text-slate-300">ANALISTA</p>
                <p>analista@empresa.com</p>
                <p>Pass: 123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
