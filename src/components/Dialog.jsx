import React from 'react';

const Dialog = ({ isOpen, type = 'alert', title, message, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 animate-in fade-in zoom-in duration-200">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${type === 'alert' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'}`}>
          {type === 'alert' ? '🔔' : '⚠️'}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6 whitespace-pre-line">{message}</p>
        
        <div className="flex gap-3 justify-center">
          {type === 'confirm' && (
            <button 
              onClick={onCancel} 
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors flex-1"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 text-white font-bold rounded-lg transition-colors flex-1 ${type === 'confirm' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
