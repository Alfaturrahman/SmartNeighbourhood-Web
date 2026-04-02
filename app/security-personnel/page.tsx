"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';
import { securityPersonnelService } from '@/services/modules/securityPersonnelService';

export default function SecurityPersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('warga');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    status: 'aktif' as 'aktif' | 'tidak aktif',
    notes: '',
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
    if (!permissions.canViewSchedule) {
      router.push('/dashboard');
      return;
    }
    
    setIsMounted(true);
    fetchPersonnel();
  }, [router]);

  const fetchPersonnel = async () => {
    try {
      setIsLoading(true);
      const response = await securityPersonnelService.getAll();
      const data = (response.results || response.data || []) as any[];
      setPersonnel(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching personnel:', error);
      await showErrorAlert('Error', 'Gagal memuat data petugas keamanan');
      setPersonnel([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPersonnel = personnel.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageSchedule) {
      showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengelola master data keamanan');
      return;
    }
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', address: '', area: '', status: 'aktif', notes: '' });
    setModalOpen(true);
  };

  const openEditModal = (person: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageSchedule) {
      showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengelola master data keamanan');
      return;
    }
    setEditingId(person.id);
    setFormData({
      name: person.name,
      phone: person.phone,
      email: person.email || '',
      address: person.address || '',
      area: person.area || '',
      status: person.status,
      notes: person.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const permissions = getPermissions(userRole);
    if (!permissions.canManageSchedule) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengelola master data keamanan');
      return;
    }
    
    setIsLoading(true);

    try {
      if (editingId) {
        await securityPersonnelService.update(editingId, formData);
        await showSuccessAlert('Berhasil!', 'Data petugas keamanan berhasil diperbarui');
      } else {
        await securityPersonnelService.create(formData);
        await showSuccessAlert('Berhasil!', 'Data petugas keamanan baru berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchPersonnel();
    } catch (error: any) {
      console.error('Error saving personnel:', error);
      await showErrorAlert('Error', error.response?.data?.error || 'Gagal menyimpan data petugas keamanan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (person: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageSchedule) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus data petugas keamanan');
      return;
    }
    
    const result = await showConfirmAlert(
      'Hapus Petugas Keamanan',
      `Apakah Anda yakin ingin menghapus data ${person.name}?`,
      'Ya, Hapus'
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await securityPersonnelService.delete(person.id);
        await showSuccessAlert('Berhasil!', 'Data petugas keamanan telah dihapus');
        fetchPersonnel();
      } catch (error: any) {
        console.error('Error deleting personnel:', error);
        await showErrorAlert('Error', error.response?.data?.error || 'Gagal menghapus data petugas keamanan');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Master Data Keamanan</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Kelola data petugas keamanan</p>
        </div>
        {isMounted && userRole === 'rw' && (
          <button onClick={openAddModal} className="w-full sm:w-auto px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
            + Tambah Petugas
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, nomor telepon, atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-white"
        />
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-t-4 border-[#FF9500]"></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Telepon</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366] hidden md:table-cell">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366] hidden md:table-cell">Area</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonnel.length > 0 ? (
                filteredPersonnel.map((person) => (
                  <tr key={person.id} className="border-b border-gray-100 hover:bg-[#F0F8FF] transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{person.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{person.phone}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm hidden md:table-cell">{person.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm hidden md:table-cell">{person.area || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        person.status === 'aktif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {person.status === 'aktif' ? '✓ Aktif' : '✕ Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {isMounted && userRole === 'rw' ? (
                        <>
                          <button onClick={() => openEditModal(person)} className="text-[#003366] hover:text-[#004d80] font-medium text-xs transition-colors">✏️ Edit</button>
                          <span className="text-gray-300">•</span>
                          <button onClick={() => handleDelete(person)} className="text-[#EF4444] hover:text-[#DC2626] font-medium text-xs transition-colors">🗑️ Hapus</button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">Hanya lihat</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data petugas keamanan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        title={editingId ? 'Edit Petugas Keamanan' : 'Tambah Petugas Keamanan Baru'}
        onClose={() => !isLoading && setModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nama *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama petugas keamanan"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Telepon *</label>
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Area</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Area/Lapangan"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap"
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'tidak aktif' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            >
              <option value="aktif">✓ Aktif</option>
              <option value="tidak aktif">✕ Tidak Aktif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#FF9500] hover:bg-[#FF8C00] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
