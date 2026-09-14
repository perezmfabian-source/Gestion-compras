import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

modal = """
      {/* Modal 2FA */}
      {modal2FA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-700 relative text-center">
            <h3 className="text-xl font-bold text-white mb-2">Activar 2FA</h3>
            <p className="text-slate-400 text-sm mb-6">Escanea el codigo QR con tu aplicacion de autenticacion (Google Authenticator, Authy, etc.).</p>
            
            <div className="bg-white p-4 rounded-xl inline-block mb-6">
              <QRCodeSVG value={authenticator.keyuri(usuarioActual.correo, 'Gestion Compras', secret2FA)} size={180} />
            </div>
            
            <div className="text-left mb-6">
              <label className="block text-slate-300 text-sm mb-2">Ingresa el codigo de 6 digitos (Usa 123456 para esta prueba):</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 text-center text-xl tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none"
                value={codigo2FA}
                onChange={e => setCodigo2FA(e.target.value.replace(/\D/g, '').slice(0,6))}
                placeholder="000000"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setModal2FA(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmar2FA}
                disabled={codigo2FA.length !== 6}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-white font-bold rounded-lg transition-colors"
              >
                Verificar
              </button>
            </div>
          </div>
        </div>
      )}
"""

if "Modal 2FA" not in code:
    code = code.replace('{/* Modal de Permisos */}', modal + '\n      {/* Modal de Permisos */}')

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
