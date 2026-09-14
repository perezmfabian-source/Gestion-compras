import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

imports = """import { QRCodeSVG } from 'qrcode.react';
import { authenticator } from 'otplib';"""
code = re.sub(r'(import React.*?\n)', r'\1' + imports + '\n', code, 1)

state_code = """
  // Estados para 2FA
  const [modal2FA, setModal2FA] = useState(false);
  const [secret2FA, setSecret2FA] = useState('');
  const [codigo2FA, setCodigo2FA] = useState('');
  const activar2FA = useAuthStore(state => state.activar2FA);
  const desactivar2FA = useAuthStore(state => state.desactivar2FA);

  const handleIniciar2FA = () => {
    const secret = authenticator.generateSecret();
    setSecret2FA(secret);
    setCodigo2FA('');
    setModal2FA(true);
  };

  const handleConfirmar2FA = () => {
    try {
      const isValid = authenticator.check(codigo2FA, secret2FA);
      if (isValid) {
        activar2FA(usuarioActual.id, secret2FA);
        setModal2FA(false);
        setDialogConfig({ isOpen: true, type: 'alert', title: '2FA Activado', message: 'Tu cuenta ahora esta protegida con Autenticacion de Dos Factores.', onConfirm: () => setDialogConfig({ isOpen: false }) });
      } else {
        setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'El codigo ingresado es incorrecto.', onConfirm: () => setDialogConfig({ isOpen: false }) });
      }
    } catch(e) {
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'Ocurrio un error verificando el codigo.', onConfirm: () => setDialogConfig({ isOpen: false }) });
    }
  };

  const handleDesactivar2FA = () => {
    desactivar2FA(usuarioActual.id);
    setDialogConfig({ isOpen: true, type: 'alert', title: '2FA Desactivado', message: 'La Autenticacion de Dos Factores ha sido deshabilitada.', onConfirm: () => setDialogConfig({ isOpen: false }) });
  };
"""
code = re.sub(r'(const \w+ = useAuthStore.*?;\n)', r'\1' + state_code + '\n', code, 1)

btn_target = r"onClick=\{.*?setDialogConfig.*?Próximamente.*?\}\s*className=\"px-4 py-2 bg-emerald-600.*?\">.*?Activar.*?<\/button>"
new_btn = """onClick={usuarioActual.mfaEnabled ? handleDesactivar2FA : handleIniciar2FA}
                    className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors ${usuarioActual.mfaEnabled ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                  >
                    {usuarioActual.mfaEnabled ? 'Desactivar' : 'Activar'}
                  </button>"""
code = re.sub(btn_target, new_btn, code, flags=re.DOTALL)

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
              <label className="block text-slate-300 text-sm mb-2">Ingresa el codigo de 6 digitos:</label>
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
code = code.replace('{/* Modal Nuevo Usuario */}', modal + '\n      {/* Modal Nuevo Usuario */}')

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
