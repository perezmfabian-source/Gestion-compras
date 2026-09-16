import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authenticator } from '../lib/totp';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
import Dialog from './Dialog';
import PermisosModal from './PermisosModal';

const GestionUsuarios = () => {
  const { 
    usuarioActual, 
    usuarios, 
    modoMantenimiento, 
    mensajeMantenimiento,
    toggleMantenimiento,
    feedbacks,
    cargarFeedbacks,
    actualizarEstadoFeedback,
    eliminarFeedback,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState('Administración');
  const [mantenimientoTexto, setMantenimientoTexto] = useState(mensajeMantenimiento);

  useEffect(() => {
    cargarFeedbacks();
  }, []);
  
  // Estados para Modal de Crear/Editar
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', correo: '', rol: 'ANALISTA COMPRAS' });
  const [usuarioPermisos, setUsuarioPermisos] = useState(null);

  const fileInputRef = useRef(null);

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) {
        setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'La foto debe ser menor a 2MB.', onConfirm: () => setDialogConfig({ isOpen: false }) });
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `user_${usuarioActual.correo.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage.from('fotos-perfil').upload(fileName, file, { upsert: true });
      if (error) {
        console.error('Error uploading photo: ', error);
        setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'Fallo al subir la foto.', onConfirm: () => setDialogConfig({ isOpen: false }) });
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('fotos-perfil').getPublicUrl(fileName);
      
      actualizarUsuario(usuarioActual.correo, { fotoUrl: publicUrl });
    }
  };
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  // Estados Perfil
  const [perfilForm, setPerfilForm] = useState({ 
    nombre: usuarioActual?.nombre || '', 
    correo: usuarioActual?.correo || '', password: '' 
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmar: '' });

  const actualizarPerfil = useAuthStore(state => state.actualizarPerfil);

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


  const guardarPerfil = async () => {
    if (!perfilForm.nombre || !perfilForm.correo) return;
    const updates = { nombre: perfilForm.nombre, correo: perfilForm.correo };
    if (perfilForm.password) updates.password = perfilForm.password;
    await actualizarPerfil(updates);
    setPerfilForm({...perfilForm, password: ''});
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Perfil Actualizado',
      message: 'Tus datos han sido actualizados exitosamente.',
      onConfirm: () => setDialogConfig({ isOpen: false })
    });
  };

  const guardarPassword = async () => {
    if (passwordForm.actual !== usuarioActual.password) {
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'La contraseña actual es incorrecta.', onConfirm: () => setDialogConfig({ isOpen: false }) });
      return;
    }
    if (passwordForm.nueva !== passwordForm.confirmar) {
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'Las contraseñas nuevas no coinciden.', onConfirm: () => setDialogConfig({ isOpen: false }) });
      return;
    }
    if (passwordForm.nueva.length < 3) {
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'La contraseña debe tener al menos 3 caracteres.', onConfirm: () => setDialogConfig({ isOpen: false }) });
      return;
    }
    await actualizarPerfil({ password: passwordForm.nueva });
    setShowPasswordModal(false);
    setPasswordForm({ actual: '', nueva: '', confirmar: '' });
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Contraseña Actualizada',
      message: 'Tu contraseña ha sido actualizada exitosamente.',
      onConfirm: () => setDialogConfig({ isOpen: false })
    });
  };

  const esAdmin = usuarioActual?.rol === 'ADMINISTRADOR';

  const handleToggleEstado = () => {
    toggleMantenimiento(!modoMantenimiento, mantenimientoTexto);
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Mantenimiento',
      message: `Modo mantenimiento ${!modoMantenimiento ? 'Activado' : 'Desactivado'} exitosamente.`,
      onConfirm: () => setDialogConfig({ isOpen: false })
    });
  };

  const handleGuardarMensaje = () => {
    toggleMantenimiento(modoMantenimiento, mantenimientoTexto);
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Mantenimiento',
      message: 'Mensaje de mantenimiento actualizado exitosamente.',
      onConfirm: () => setDialogConfig({ isOpen: false })
    });
  };

  const abrirModalNuevo = () => {
    setUsuarioEditando(null);
    setFormData({ nombre: '', correo: '', rol: 'ANALISTA COMPRAS' });
    setShowModal(true);
  };

  const abrirModalEditar = (u) => {
    setUsuarioEditando(u.id);
    let mappedRol = u.rol;
    if (mappedRol === 'ANALISTA') mappedRol = 'ANALISTA COMPRAS';
    setFormData({ nombre: u.nombre, correo: u.correo, rol: mappedRol });
    setShowModal(true);
  };

  const guardarUsuario = () => {
    if (!formData.nombre || !formData.correo) return;
    
    if (usuarioEditando) {
      actualizarUsuario(usuarioEditando, formData);
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Usuario Actualizado', message: 'Los datos del usuario han sido actualizados exitosamente.', onConfirm: () => setDialogConfig({ isOpen: false }) });
    } else {
      agregarUsuario(formData);
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Usuario Creado', message: 'El nuevo usuario ha sido creado exitosamente.', onConfirm: () => setDialogConfig({ isOpen: false }) });
    }
    setShowModal(false);
  };

  const toggleEstadoUsuario = (u) => {
    if (u.id === usuarioActual.id) {
      setDialogConfig({
        isOpen: true,
        type: 'alert',
        title: 'Acción Denegada',
        message: 'No puedes desactivar tu propio usuario.',
        onConfirm: () => setDialogConfig({ isOpen: false })
      });
      return;
    }
    const nuevoEstado = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    actualizarUsuario(u.id, { estado: nuevoEstado });
  };

  const handleEliminar = (u) => {
    if (u.id === usuarioActual.id) {
      setDialogConfig({
        isOpen: true,
        type: 'alert',
        title: 'Acción Denegada',
        message: 'No puedes eliminar tu propio usuario.',
        onConfirm: () => setDialogConfig({ isOpen: false })
      });
      return;
    }
    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de eliminar a ${u.nombre}?`,
      onConfirm: () => {
        eliminarUsuario(u.id);
        setDialogConfig({ isOpen: false });
      }
    });
  };

  if (!esAdmin && activeTab === 'Administración') {
    // Si no es admin, forzar a Mi Perfil
    setActiveTab('Mi Perfil');
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestión de Usuario</h1>
            <p className="text-slate-400 mt-1 text-sm">Gestiona tu información personal y configuración de cuenta</p>
          </div>
          <button 
            onClick={() => useAuthStore.getState().cerrarSesion()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold rounded-lg transition-colors text-slate-300"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Pestañas */}
        <div className="flex border-b border-slate-700/50 mt-8">
          <button 
            onClick={() => setActiveTab('Mi Perfil')}
            className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'Mi Perfil' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            👤 Mi Perfil
          </button>
          {esAdmin && (
            <button 
              onClick={() => setActiveTab('Administración')}
              className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'Administración' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ Administración
            </button>
          )}
          {esAdmin && (
            <button 
              onClick={() => setActiveTab('Checklist')}
              className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'Checklist' 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Checklist Mejoras
            </button>
          )}
        </div>

        {/* Contenido de Mi Perfil */}
        {activeTab === 'Mi Perfil' && (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Columna Izquierda: Tarjeta de Perfil */}
            <div className="w-full md:w-80 bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg flex flex-col items-center text-center h-fit">
              <div className="relative inline-block mb-4">
                <div className="w-[110px] h-[110px] rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="w-[100px] h-[100px] rounded-full border-2 border-rose-500 flex items-center justify-center overflow-hidden">
                    {usuarioActual?.fotoUrl ? (
                      <img src={usuarioActual.fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-rose-500">{usuarioActual?.nombre?.substring(0, 2).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-blue-500 hover:bg-blue-400 p-2 rounded-full text-white shadow-lg transition-colors border-2 border-[#1E293B]"
                >
                  📷
                </button>
                <input type="file" ref={fileInputRef} onChange={handleProfilePhotoUpload} accept="image/*" className="hidden" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase">{usuarioActual?.nombre}</h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{usuarioActual?.rol}</p>
              
              <div className="mt-6 px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full inline-block">
                <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">• RANGO: {usuarioActual?.rol}</span>
              </div>
            </div>

            {/* Columna Derecha: Formularios */}
            <div className="flex-1 space-y-4">
              
              {/* Info Personal */}
              <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={perfilForm.nombre}
                      onChange={e => setPerfilForm({...perfilForm, nombre: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium">Correo Electrónico (Usuario)</label>
                    <input 
                      type="email" 
                      value={perfilForm.correo}
                      onChange={e => setPerfilForm({...perfilForm, correo: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6">
                  <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                    📷
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">Cambiar foto de perfil</p>
                    <p className="text-xs text-slate-500 mt-0.5">Haz clic en el ícono de cámara sobre tu foto actual para actualizarla.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={guardarPerfil}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>

              {/* Seguridad */}
              <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl border border-blue-500/20">
                    🛡️
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Seguridad de la Cuenta</p>
                    <p className="text-xs text-slate-500 mt-0.5">Protege tu cuenta actualizando tu contraseña periódicamente.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-transparent hover:bg-slate-800 border border-slate-600 text-slate-300 font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  Cambiar Contraseña
                </button>
              </div>

              {/* 2FA */}
              <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl border border-emerald-500/20">
                    📱
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Autenticación de Dos Factores (2FA)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Añade una capa extra de seguridad requiriendo un código desde tu celular.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDialogConfig({ isOpen: true, type: 'alert', title: 'Próximamente', message: 'La configuración de 2FA estará disponible en la próxima actualización de seguridad.', onConfirm: () => setDialogConfig({ isOpen: false }) })}
                  className="px-6 py-2 bg-transparent hover:bg-slate-800 border border-slate-600 text-slate-300 font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  Activar
                </button>
              </div>

            </div>
          </div>
        )}

                  {/* Contenido de Checklist */}
          {activeTab === 'Checklist' && esAdmin && (
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle className="w-5 h-5" /> Checklist de Observaciones
                </h2>
                <button onClick={() => cargarFeedbacks()} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shadow-sm">
                  Actualizar Lista
                </button>
              </div>

              {(!feedbacks || feedbacks.length === 0) ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                  <CheckCircle className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No hay observaciones pendientes.</p>
                  <p className="text-slate-500 text-sm">¡Todo marcha perfecto!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className={`p-5 rounded-xl border transition-all ${fb.estado === 'CORREGIDO' ? 'bg-emerald-900/10 border-emerald-500/20 opacity-70' : 'bg-slate-800 border-slate-600 shadow-md'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-sm text-white flex items-center gap-2">
                            {fb.usuario_nombre}
                            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-normal">
                              {fb.usuario_email}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(fb.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {fb.estado === 'CORREGIDO' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold uppercase">
                              <CheckCircle className="w-3 h-3" /> Corregido
                            </span>
                          ) : (
                            <button 
                              onClick={() => actualizarEstadoFeedback(fb.id, 'CORREGIDO')}
                              className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:scale-105"
                            >
                              <Clock className="w-3.5 h-3.5" /> Marcar Resuelto
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDialogConfig({
                                isOpen: true,
                                type: 'confirm',
                                title: 'Eliminar Observación',
                                message: '¿Estás seguro de eliminar esta observación?',
                                onConfirm: () => {
                                  eliminarFeedback(fb.id);
                                  setDialogConfig({ isOpen: false });
                                }
                              });
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg transition-colors border border-slate-700"
                            title="Eliminar observación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm mt-3 p-3 rounded-lg bg-slate-900/50 ${fb.estado === 'CORREGIDO' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {fb.mensaje}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contenido de Administración */}
        {activeTab === 'Administración' && esAdmin && (
          <div className="space-y-6">
            
            {/* Panel de Mantenimiento */}
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg">
              <h2 className="text-sm font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wide">
                ⚙️ CONFIGURACIÓN DEL SISTEMA (MODO MANTENIMIENTO)
              </h2>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Activa este modo para bloquear el acceso a todos los usuarios no administradores mientras realizas cambios en el sistema. Los cambios aplican en tiempo real.
              </p>
              
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="w-48 shrink-0">
                  <label className="block text-xs text-slate-400 mb-1">Estado</label>
                  <button 
                    onClick={handleToggleEstado}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-colors border ${
                      modoMantenimiento 
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {modoMantenimiento ? 'Mantenimiento Activo' : 'Mantenimiento Inactivo'}
                  </button>
                </div>
                
                <div className="flex-1 w-full">
                  <label className="block text-xs text-slate-400 mb-1">Mensaje para los usuarios</label>
                  <input 
                    type="text" 
                    value={mantenimientoTexto}
                    onChange={(e) => setMantenimientoTexto(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-rose-500"
                  />
                </div>
                
                <button 
                  onClick={handleGuardarMensaje}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-lg transition-colors shrink-0"
                >
                  Guardar Mensaje
                </button>
              </div>
            </div>

            {/* Base de Usuarios */}
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wide">
                  👥 Base de Usuarios
                </h2>
                <button 
                  onClick={abrirModalNuevo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  + Nuevo Usuario
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-800 text-xs text-slate-300 font-semibold border-b border-slate-700">
                      <th className="py-3 px-4 rounded-tl-lg">Nombre</th>
                      <th className="py-3 px-4">Correo</th>
                      <th className="py-3 px-4 text-center">Rol</th>
                      <th className="py-3 px-4 text-center">Estado / Aprobar</th>
                      <th className="py-3 px-4 text-center rounded-tr-lg">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usuarios.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-200">{u.nombre}</td>
                        <td className="py-4 px-4 text-slate-400">{u.correo}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-[10px] font-bold tracking-wider">
                            {u.rol}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button 
                            onClick={() => toggleEstadoUsuario(u)}
                            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                              u.estado === 'ACTIVO' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
                            }`}
                          >
                            {u.estado}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center flex justify-center gap-2">
                          <button 
                            onClick={() => setUsuarioPermisos(u)}
                            className="p-2 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20 transition-colors" 
                            title="Ver Permisos"
                          >
                            🛡️
                          </button>
                          <button onClick={() => abrirModalEditar(u)} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors" title="Editar">
                            ✏️
                          </button>
                          <button onClick={() => handleEliminar(u)} className="p-2 bg-slate-700/50 text-slate-400 rounded hover:bg-slate-700 transition-colors" title="Eliminar">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal Crear/Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white">
                {usuarioEditando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={formData.correo}
                  onChange={e => setFormData({...formData, correo: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Rol</label>
                <select 
                  value={formData.rol}
                  onChange={e => setFormData({...formData, rol: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                    <option value="ANALISTA COMPRAS">ANALISTA COMPRAS</option>
                    <option value="ALMACENISTA">ALMACENISTA</option>
                    <option value="PRESUPUESTADOR">PRESUPUESTADOR</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  </select>
              </div>
              {!usuarioEditando && (
                <p className="text-xs text-amber-500 mt-2">
                  La contraseña por defecto para nuevos usuarios es: <strong>123</strong>
                </p>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarUsuario}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
              >
                Guardar Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        isOpen={dialogConfig.isOpen}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onConfirm={dialogConfig.onConfirm}
        onCancel={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
      />
      
      {usuarioPermisos && (
        <PermisosModal 
          usuario={usuarioPermisos} 
          onClose={() => setUsuarioPermisos(null)} 
        />
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-sm border border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white">Cambiar Contraseña</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Contraseña Actual</label>
                <input 
                  type="password" 
                  value={passwordForm.actual}
                  onChange={e => setPasswordForm({...passwordForm, actual: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwordForm.nueva}
                  onChange={e => setPasswordForm({...passwordForm, nueva: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmar}
                  onChange={e => setPasswordForm({...passwordForm, confirmar: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;


