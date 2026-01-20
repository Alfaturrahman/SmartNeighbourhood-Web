'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're on login/landing page BEFORE rendering
  const isLoginOrLandingPage = pathname === '/login' || pathname === '/';

  useEffect(() => {
    setIsMounted(true);
    // Check if user is logged in on mount and pathname change
    const userData = localStorage.getItem('user');
    const logged = !!userData;
    setIsLoggedIn(logged);

    // If not logged in dan bukan di login page, redirect to login
    if (!logged && pathname !== '/login' && pathname !== '/') {
      router.push('/login');
    }

    // Close sidebar when route changes
    setSidebarOpen(false);
  }, [pathname, router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // CRITICAL: Render without layout untuk login page atau landing page
  // Ini harus dicek SEBELUM conditional rendering untuk avoid layout flashing
  if (isLoginOrLandingPage) {
    return <>{children}</>;
  }

  // Jika belum mounted atau belum check login status, render tanpa layout
  if (!isMounted || !isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden" suppressHydrationWarning>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - responsive */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar onClose={closeSidebar} />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
