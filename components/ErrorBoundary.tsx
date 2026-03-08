'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Terjadi Kesalahan
            </h2>
            <p className="text-gray-600 mb-6">
              Maaf, ada yang tidak beres. Silakan refresh halaman atau hubungi administrator.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-200"
              >
                🔄 Refresh Halaman
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
              >
                🏠 Kembali ke Dashboard
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-xs font-mono text-red-600 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
