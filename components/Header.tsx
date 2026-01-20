import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003366] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            🏘️
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#003366]">Smart Neighborhood</h1>
            <p className="text-xs text-gray-500">Manajemen Komunitas</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-[#EF4444] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
