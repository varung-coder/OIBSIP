import React, { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ERROR BOUNDARY] Intercepted runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-premium text-center border border-rose-500/20">
            <FiAlertTriangle className="mx-auto w-16 h-16 text-rose-500 mb-4 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 font-sans">
              System Interface Error
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              {this.state.error?.message || 'A UI component failed to load. The issue has been logged.'}
            </p>
            <button
              onClick={() => window.location.replace('/')}
              className="px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 duration-200"
            >
              Return to Safety
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
