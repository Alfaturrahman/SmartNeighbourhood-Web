"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
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

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('resident');
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
    const user = JSON.parse(userData);
    setUserRole(user.role);
    
    const permissions = getPermissions(user.role);
    if (!permissions.canViewResidents) {
      router.push('/dashboard');
      return;
    }
    
    setResidents(DUMMY_RESIDENTS);
  }, [router]);

  const filteredResidents = residents.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', phone: '', email: '', status: 'aktif' });
    setModalOpen(true);
  };

  const openEditModal = (resident: any) => {
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

  const handleDelete = async (resident: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageResidents) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus data warga');
      return;
    }
    
    const result = await showConfirmAlert(
      'Hapus Warga',
      `Apakah Anda yakin ingin menghapus ${resident.name}?`,
      'Ya, Hapus'
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      setTimeout(() => {
        setResidents(residents.filter(r => r.id !== resident.id));
        setIsLoading(false);
        showSuccessAlert('Berhasil!', `${resident.name} telah dihapus dari sistem`);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F5]">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#003366]">Manajemen Warga</h2>
                <p className="text-gray-600 mt-1">Total {filteredResidents.length} warga terdaftar</p>
              </div>
              {getPermissions(userRole).canManageResidents && (
                <button
                  onClick={openAddModal}
                  className="px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  + Tambah Warga
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Cari berdasarkan nama atau alamat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>

            {/* Residents Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-t-4 border-[#FF9500]"></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Nama</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Telepon</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Alamat</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResidents.map((resident) => (
                      <tr key={resident.id} className="border-b border-gray-100 hover:bg-[#F0F8FF] transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{resident.name}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{resident.email}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{resident.phone}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{resident.address}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            resident.status === 'aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {resident.status === 'aktif' ? '✓' : '✕'} {resident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {getPermissions(userRole).canManageResidents ? (
                            <>
                              <button
                                onClick={() => openEditModal(resident)}
                                className="text-[#003366] hover:text-[#004d80] font-medium text-xs transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <span className="text-gray-300">•</span>
                              <button
                                onClick={() => handleDelete(resident)}
                                className="text-[#EF4444] hover:text-[#DC2626] font-medium text-xs transition-colors"
                              >
                                🗑️ Hapus
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">Tidak ada akses</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredResidents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">Tidak ada warga ditemukan</p>
                  <p className="text-sm mt-1">Coba ubah filter pencarian Anda</p>
                </div>
              )}
            </div>
          </div>
        </main>
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
