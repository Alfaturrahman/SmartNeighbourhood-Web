"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';

const DUMMY_RESIDENTS = [
  { id: 1, name: 'Budi Santoso', address: 'Jl. Mawar No. 10', phone: '08123456789', email: 'budi@contoh.com', status: 'aktif' },
  { id: 2, name: 'Siti Nurhaliza', address: 'Jl. Melati No. 15', phone: '08234567890', email: 'siti@contoh.com', status: 'aktif' },
  { id: 3, name: 'Ahmad Wijaya', address: 'Jl. Bunga No. 20', phone: '08345678901', email: 'ahmad@contoh.com', status: 'aktif' },
  { id: 4, name: 'Dwi Retno', address: 'Jl. Anggrek No. 25', phone: '08456789012', email: 'dwi@contoh.com', status: 'tidak aktif' },
  { id: 5, name: 'Riyanto', address: 'Jl. Tulip No. 30', phone: '08567890123', email: 'riyanto@contoh.com', status: 'aktif' },
];

export default function DashboardPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('resident');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'aktif',
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setUserRole(parsedUser.role);
    setResidents(DUMMY_RESIDENTS);
  }, [router]);

  const stats = [
    { label: 'Total Warga', value: residents.length, icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Warga Aktif', value: residents.filter(r => r.status === 'aktif').length, icon: '✅', color: 'from-green-500 to-green-600' },
    { label: 'Tidak Aktif', value: residents.filter(r => r.status === 'tidak aktif').length, icon: '⚠️', color: 'from-red-500 to-red-600' },
  ];

  const openAddModal = () => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageResidents) {
      showErrorAlert('Akses Ditolak', 'Hanya RT/RW yang dapat menambah warga');
      return;
    }
    setEditingId(null);
    setFormData({ name: '', address: '', phone: '', email: '', status: 'aktif' });
    setModalOpen(true);
  };

  const openEditModal = (resident: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageResidents) {
      showErrorAlert('Akses Ditolak', 'Hanya RT/RW yang dapat mengedit warga');
      return;
    }
    setEditingId(resident.id);
    setFormData({
      name: resident.name,
      address: resident.address,
      phone: resident.phone,
      email: resident.email,
      status: resident.status,
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const permissions = getPermissions(userRole);
    if (!permissions.canManageResidents) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengelola data warga');
      return;
    }
    
    setIsLoading(true);

    setTimeout(async () => {
      if (editingId) {
        const updatedResidents = residents.map(r =>
          r.id === editingId ? { ...r, ...formData } : r
        );
        setResidents(updatedResidents);
        setIsLoading(false);
        setModalOpen(false);
        await showSuccessAlert('Berhasil!', 'Data warga berhasil diperbarui');
      } else {
        const newResident = {
          id: Math.max(...residents.map(r => r.id)) + 1,
          ...formData,
        };
        setResidents([...residents, newResident]);
        setIsLoading(false);
        setModalOpen(false);
        await showSuccessAlert('Berhasil!', 'Warga baru berhasil ditambahkan');
      }
    }, 600);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#003366] mb-1">Dashboard</h2>
        <p className="text-gray-600 text-sm md:text-base">Selamat datang, {user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.color} h-1`}></div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl md:text-3xl">{stat.icon}</span>
                <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Residents Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-t-4 border-[#66CC66]"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 gap-4">
          <h3 className="text-lg font-bold text-[#003366]">Daftar Warga Terbaru</h3>
          {getPermissions(userRole).canManageResidents && (
            <button
              onClick={openAddModal}
              className="w-full md:w-auto px-4 py-2 bg-[#FF9500] hover:bg-[#FF8C00] text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              + Tambah Warga
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366]">Nama</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366] hidden md:table-cell">Alamat</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366] hidden md:table-cell">Telepon</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366]">Status</th>
              </tr>
            </thead>
            <tbody>
              {residents.slice(0, 5).map((resident) => (
                <tr key={resident.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <p className="font-medium text-gray-900 text-sm md:text-base">{resident.name}</p>
                    <p className="text-xs text-gray-500 md:hidden">{resident.address}</p>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-sm hidden md:table-cell">{resident.address}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-sm hidden md:table-cell">{resident.phone}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                      resident.status === 'aktif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {resident.status === 'aktif' ? '✓' : '✕'} {resident.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 md:px-6 py-4 border-t border-gray-200 text-center">
          <a href="/residents" className="text-sm font-medium text-[#003366] hover:text-[#004d80] transition-colors">
            Lihat semua warga →
          </a>
        </div>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        title={editingId ? 'Edit Warga' : 'Tambah Warga Baru'}
        onClose={() => !isLoading && setModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="budi@contoh.com"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Telepon *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08123456789"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              >
                <option value="aktif">✓ Aktif</option>
                <option value="tidak aktif">✕ Tidak Aktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Alamat *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Mawar No. 10, RT 01, RW 02"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#66CC66] hover:bg-[#59B359] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Menyimpan...
                </>
              ) : (
                '✓ Simpan'
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={isLoading}
              className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
