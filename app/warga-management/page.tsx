"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { wargaService } from '@/services/modules/wargaService';
import type { Warga, WargaCreateData } from '@/services/modules/wargaService';

export default function WargaManagementPage() {
  const [wargas, setWargas] = useState<Warga[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'tidak aktif'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [formData, setFormData] = useState<WargaCreateData>({
    name: '',
    email: '',
    phone: '',
    address: '',
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
    
    // Only RT can access this page
    if (parsedUser.role !== 'rt') {
      showErrorAlert('Akses Ditolak', 'Hanya RT yang dapat mengelola Warga');
      router.push('/dashboard');
      return;
    }
    
    setUser(parsedUser);
    fetchWargas();
  }, [router]);

  const fetchWargas = async () => {
    try {
      setIsLoading(true);
      const response = await wargaService.getAll();
      const data = (response.results || response.data || []) as Warga[];
      setWargas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching wargas:', error);
      await showErrorAlert('Error', 'Gagal memuat data warga');
      setWargas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWargas = wargas.filter((warga) => {
    const matchStatus = statusFilter === 'all' || warga.status === statusFilter;
    const matchSearch =
      warga.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warga.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warga.phone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filteredWargas.length / pageSize);
  const paginatedWargas = filteredWargas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'aktif',
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email) {
      await showErrorAlert('Validasi', 'Nama dan Email harus diisi');
      return;
    }

    if (!formData.email.includes('@')) {
      await showErrorAlert('Validasi', 'Format email tidak valid');
      return;
    }

    setIsLoading(true);

    try {
      if (editingId) {
        // Update existing warga
        await wargaService.update(editingId, formData);
        await showSuccessAlert('Berhasil', 'Data warga berhasil diperbarui');
      } else {
        // Create new warga
        const response = await wargaService.create(formData);
        const generatedPass = response.data?.generated_password || '';
        
        await showSuccessAlert(
          'Warga Berhasil Ditambahkan',
          `Email: ${response.data?.user_email}\nPassword: ${generatedPass}\n\nBagikan kredensial ini ke Warga untuk login.`
        );
      }

      setModalOpen(false);
      setCurrentPage(1);
      fetchWargas(); // Refresh list
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = error.data?.email?.[0] || error.message || 'Terjadi kesalahan';
      await showErrorAlert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWarga = async (id: number, name: string) => {
    const result = await showConfirmAlert(
      'Hapus Warga',
      `Apakah Anda yakin ingin menghapus warga "${name}"?`
    );

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await wargaService.delete(id);
      await showSuccessAlert('Berhasil', 'Warga berhasil dihapus');
      fetchWargas();
    } catch (error: any) {
      console.error('Error:', error);
      await showErrorAlert('Error', 'Gagal menghapus warga');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Manajemen Warga</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Total {wargas.length} warga terdaftar</p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          + Tambah Warga Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl md:text-3xl">👥</span>
              <p className="text-xs md:text-sm text-gray-600">Total Warga</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{wargas.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-1"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl md:text-3xl">✅</span>
              <p className="text-xs md:text-sm text-gray-600">Warga Aktif</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{wargas.filter((w) => w.status === 'aktif').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 h-1"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl md:text-3xl">⚠️</span>
              <p className="text-xs md:text-sm text-gray-600">Tidak Aktif</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{wargas.filter((w) => w.status === 'tidak aktif').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, email, atau telepon..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366]"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="tidak aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-t-4 border-[#66CC66]"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366]">Nama</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366] hidden md:table-cell">Email</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366] hidden md:table-cell">Telepon</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366]">Status</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-6 py-3 md:py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paginatedWargas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-6 py-3 md:py-4 text-center text-gray-500">
                    {wargas.length === 0 ? 'Belum ada data warga' : 'Tidak ada warga yang cocok dengan filter'}
                  </td>
                </tr>
              ) : (
                paginatedWargas.map((warga) => (
                  <tr key={warga.id} className="border-b border-gray-100 hover:bg-[#F0F8FF] transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <p className="font-medium text-gray-900 text-sm md:text-base">{warga.name}</p>
                      <p className="text-xs text-gray-500 md:hidden">{warga.email}</p>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-sm hidden md:table-cell">{warga.email}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-sm hidden md:table-cell">{warga.phone || '-'}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          warga.status === 'aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {warga.status === 'aktif' ? '✓ Aktif' : '✗ Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-sm space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(warga.id);
                          setFormData({
                            name: warga.name,
                            email: warga.email,
                            phone: warga.phone,
                            address: warga.address,
                            status: warga.status,
                          });
                          setModalOpen(true);
                        }}
                        className="text-[#003366] hover:text-[#004d80] font-medium text-xs transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => handleDeleteWarga(warga.id, warga.name)}
                        className="text-[#EF4444] hover:text-[#DC2626] font-medium text-xs transition-colors"
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredWargas.length > 0
              ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredWargas.length)} dari ${filteredWargas.length} warga`
              : '0 warga'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              ← Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-[#003366] text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Warga' : 'Tambah Warga Baru'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Warga *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama warga"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              required
              disabled={editingId !== null}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (Login) *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Masukkan email warga"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              required
              disabled={editingId !== null}
            />
            {!editingId && <p className="text-xs text-gray-500 mt-1">Email akan digunakan untuk login</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder="Nomor telepon warga"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Alamat lengkap warga"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#003366] text-white py-2 rounded-lg hover:bg-[#002244] font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : editingId ? 'Update' : 'Daftarkan Warga'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
