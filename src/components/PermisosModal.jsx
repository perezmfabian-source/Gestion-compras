import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const modulos = [
  { id: 'ordenes', label: 'Gestor de Ofertas (Órdenes)', desc: 'Creación, edición y gestión de órdenes de compra.' },
  { id: 'almacen', label: 'Almacén (Recepción)', desc: 'Recepción de material e inventario.' },
  { id: 'facturas', label: 'Causación de Facturas', desc: 'Registro de facturas contra almacén y órdenes.' },
  { id: 'cuentas', label: 'Cuentas por Pagar', desc: 'Control de pagos y saldos a proveedores.' },
  { id: 'proveedores', label: 'CRM Proveedores', desc: 'Gestión de la base maestra de terceros.' },
  { id: 'configuracion', label: 'Configuración Tributaria', desc: 'Gestión de tarifas e impuestos.' }
];

const PermisosModal = ({ usuario, onClose }) => {
  const actualizarUsuario = useAuthStore(state => state.actualizarUsuario);
  
  // Clonar permisos actuales
  const [permisos, setPermisos] = useState({});

  useEffect(() => {
    if (usuario && usuario.permisos) {
      setPermisos(JSON.parse(JSON.stringify(usuario.permisos)));
    } else {
      // Default vacío
      const defaults = {};
      modulos.forEach(m => {
        defaults[m.id] = { lectura: false, escritura: false, borrado: false, especial: false };
      });
      setPermisos(defaults);
    }
  }, [usuario]);

  const togglePermiso = (moduloId, accion) => {
    setPermisos(prev => ({
      ...prev,
      [moduloId]: {
        ...prev[moduloId],
        [accion]: !prev[moduloId][accion]
      }
    }));
  };

  const guardarCambios = async () => {
    await actualizarUsuario(usuario.id, { permisos });
    onClose();
  };

  if (!usuario) return null;

  const isAdmin = usuario.rol === 'ADMINISTRADOR';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 font-bold">
              🛡️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Matriz de Permisos</h3>
              <p className="text-sm text-slate-400">Configurando acceso para <span className="font-bold text-white">{usuario.nombre}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isAdmin && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
              <strong className="font-bold">Administrador:</strong> Este usuario tiene acceso total a todo el sistema por defecto. Los interruptores aquí son ignorados a menos que le cambies el rol.
            </div>
          )}

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="py-4 px-6 font-bold text-slate-300">SECCIÓN</th>
                  <th className="py-4 px-4 text-center font-bold text-slate-300">LECTURA</th>
                  <th className="py-4 px-4 text-center font-bold text-slate-300">ESCRITURA</th>
                  <th className="py-4 px-4 text-center font-bold text-slate-300">BORRADO</th>
                  <th className="py-4 px-4 text-center font-bold text-slate-300">
                    ESPECIAL<br/><span className="text-[10px] font-normal text-slate-500">(Aprobar/Exportar)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {modulos.map(mod => {
                  const perms = permisos[mod.id] || { lectura: false, escritura: false, borrado: false, especial: false };
                  return (
                    <tr key={mod.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-200">{mod.label}</p>
                        <p className="text-xs text-slate-500">{mod.desc}</p>
                      </td>
                      {['lectura', 'escritura', 'borrado', 'especial'].map(accion => (
                        <td key={accion} className="py-4 px-4 text-center">
                          <button
                            disabled={isAdmin}
                            onClick={() => togglePermiso(mod.id, accion)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${
                              perms[accion] ? 'bg-rose-500' : 'bg-slate-600'
                            } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span 
                              className={`absolute top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                                perms[accion] ? 'left-[22px]' : 'left-0.5'
                              }`} 
                            />
                          </button>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <p className="text-xs text-slate-400">Los cambios aplicarán inmediatamente en la base de datos.</p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              disabled={isAdmin}
              onClick={guardarCambios}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-rose-900/20"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermisosModal;
