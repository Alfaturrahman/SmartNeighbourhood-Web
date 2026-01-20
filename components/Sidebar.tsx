import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPermissions, roleLabels, roleIcons, UserRole } from '@/lib/rolePermissions';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'security', 'resident'] },
  { href: '/residents', label: 'Manajemen Warga', icon: '👥', roles: ['admin'] },
  { href: '/security-schedule', label: 'Jadwal Keamanan', icon: '🔐', roles: ['admin', 'security'] },
  { href: '/feedback', label: 'Feedback', icon: '💬', roles: ['admin', 'resident'] },
  { href: '/announcements', label: 'Pengumuman', icon: '📢', roles: ['admin', 'security', 'resident'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role || 'resident');
    }
  }, []);

  const visibleMenuItems = MENU_ITEMS.filter((item) =>
    item.roles.includes(userRole || 'resident')
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 flex flex-col">
      <nav className="p-4 space-y-2 flex-1">
        {userRole && (
          <div className="mb-6 pb-4 border-b border-gray-200">
            <p className="text-xs font-semibold text-[#003366] uppercase tracking-wider">Akses sebagai</p>
            <p className="text-sm font-bold text-[#003366] mt-1 flex items-center gap-2">
              <span>{roleIcons[userRole]}</span>
              {roleLabels[userRole]}
            </p>
          </div>
        )}
        
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#E8F4F8] text-[#003366] border-l-4 border-[#003366]'
                  : 'text-gray-700 hover:bg-[#F0F8FF] hover:text-[#003366]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
