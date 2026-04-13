'use client';

import { useState, useEffect } from 'react';

/**
 * iOS Install Prompt Component
 * Menampilkan banner instruksi install di iOS Safari
 * Karena iOS tidak punya auto-install prompt seperti Android
 */
export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                                (window.navigator as any).standalone === true;
    
    // Check if user already dismissed prompt (localStorage)
    const hasPromptBeenDismissed = localStorage.getItem('ios-install-prompt-dismissed') === 'true';

    // Show prompt only if:
    // 1. Running on iOS
    // 2. NOT in standalone mode (not installed)
    // 3. User hasn't dismissed it before
    if (isIOS && !isInStandaloneMode && !hasPromptBeenDismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem('ios-install-prompt-dismissed', 'true');
    
    // Auto-show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('ios-install-prompt-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl border-t-4 border-blue-400 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 bg-white rounded-lg p-2 shadow-md">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              📱 Install Smart Neighborhood App
            </h3>
            <p className="text-sm text-blue-100 mb-2">
              Install aplikasi untuk pengalaman terbaik - akses cepat dari Home Screen!
            </p>
            
            {/* Instructions */}
            <div className="bg-blue-800/50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-blue-200">1.</span>
                <span>Tap tombol <strong>Share</strong> (
                  <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                ) di toolbar bawah</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-200">2.</span>
                <span>Scroll kebawah → Tap <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-200">3.</span>
                <span>Tap <strong>"Add"</strong> di kanan atas</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white hover:text-blue-200 transition-colors p-1"
            aria-label="Tutup"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Nanti Saja
        </button>
      </div>
    </div>
  );
}
