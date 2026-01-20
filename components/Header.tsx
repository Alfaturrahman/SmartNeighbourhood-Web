import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger - hanya muncul di mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 relative"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-[#003366] transition-all duration-300 ${
                sidebarOpen ? 'rotate-45 translate-y-2' : 'mb-1.5'
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#003366] transition-all duration-300 ${
                sidebarOpen ? 'opacity-0' : 'mb-1.5'
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#003366] transition-all duration-300 ${
                sidebarOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              🏘️
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[#003366]">Smart Neighborhood</h1>
              <p className="text-xs text-gray-500">Manajemen Komunitas</p>
            </div>
          </div>
        </div>

        {/* Right: Logout */}
        <button
          onClick={handleLogout}
          className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-[#EF4444] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors duration-200 whitespace-nowrap"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
