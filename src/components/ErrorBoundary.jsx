import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de repuesto
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-200">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-rose-500/20 rounded-full text-rose-500 border border-rose-500/30">
                <AlertTriangle className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Algo salió mal</h1>
            <p className="text-slate-400 mb-6 text-sm">
              Un componente interno ha fallado. No te preocupes, el resto de la aplicación está segura. Intenta recargar la página para continuar.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-slate-950 p-4 rounded-lg mb-6 overflow-auto max-h-40 border border-slate-800">
                <p className="text-rose-400 font-mono text-xs">{this.state.error.toString()}</p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <RefreshCcw className="w-4 h-4" />
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
