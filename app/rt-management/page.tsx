"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { rtService } from '@/services/modules/rtService';
import { residentService } from '@/services/modules/residentService';
import type { RT, RTCreateData } from '@/services/modules/rtService';

export default function RTManagementPage() {
  const [rts, setRts] = useState<RT[]>([]);
  const [filteredRts, setFilteredRts] = useState<RT[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalWarga, setTotalWarga] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [formData, setFormData] = useState<RTCreateData>({
    name: '',
    email: '',
    phone: '',
    area: '',
    address: '',
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    
    // Only RW can access this page
    if (parsedUser.role !== 'rw') {
      showErrorAlert('Akses Ditolak', 'Hanya RW yang dapat mengelola RT');
      router.push('/dashboard');
      return;
    }
    
    setUser(parsedUser);
    fetchRTs();
    fetchTotalWarga();
  }, [router]);

  const fetchRTs = async () => {
    try {
      setIsLoading(true);
      const response = await rtService.getAll();
      const data = (response.results || response.data || []) as RT[];
      setRts(Array.isArray(data) ? data : []);
      setFilteredRts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching RTs:', error);
      await showErrorAlert('Error', 'Gagal memuat data RT');
      setRts([]);
      setFilteredRts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredRts(rts);
      return;
    }
    
    const filtered = rts.filter((rt) =>
      rt.name.toLowerCase().includes(value.toLowerCase()) ||
      rt.user_email.toLowerCase().includes(value.toLowerCase()) ||
      (rt.area && rt.area.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredRts(filtered);
  };

  const fetchTotalWarga = async () => {
    try {
      const response = await residentService.getAll();
      const data = (response.results || response.data || []) as any[];
      setTotalWarga(Array.isArray(data) ? data.length : 0);
    } catch (error: any) {
      console.error('Error fetching total warga:', error);
      setTotalWarga(0);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setGeneratedPassword('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      area: '',
      address: '',
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
        // Update existing RT - only send updatable fields
        const updatePayload = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        };
        await rtService.update(editingId, updatePayload);
        await showSuccessAlert('Berhasil', 'Data RT berhasil diperbarui');
      } else {
        // Create new RT
        const response = await rtService.create(formData);
        const generatedPass = response.data?.generated_password || 'passw0rd';
        setGeneratedPassword(generatedPass);
        
        // Show password modal
        await showSuccessAlert(
          'RT Berhasil Dibuat',
          `Email: ${response.data?.user_email}\nPassword: ${generatedPass}\n\nPassword default untuk semua akun baru adalah: passw0rd\nBagikan kredensial ini ke RT untuk login.`
        );
      }

      setModalOpen(false);
      fetchRTs(); // Refresh list
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = error.data?.email?.[0] || error.message || 'Terjadi kesalahan';
      await showErrorAlert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRT = async (id: number, name: string) => {
    const result = await showConfirmAlert(
      'Hapus RT',
      `Apakah Anda yakin ingin menghapus RT "${name}"?`
    );

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await rtService.delete(id);
      await showSuccessAlert('Berhasil', 'RT berhasil dihapus');
      fetchRTs();
    } catch (error: any) {
      console.error('Error:', error);
      await showErrorAlert('Error', 'Gagal menghapus RT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRTPassword = async (id: number, name: string) => {
    const result = await showConfirmAlert(
      'Reset Password RT',
      `Apakah Anda yakin ingin mereset password RT "${name}"?`,
      'Ya, Reset'
    );

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      const response = await rtService.resetPassword(id);
      console.log('Reset RT Password Response:', response);
      const newPassword = response.data?.data?.new_password || response.data?.new_password || 'passw0rd';
      const userEmail = response.data?.data?.user_email || response.data?.user_email || 'Email tidak ditemukan';
      setGeneratedPassword(newPassword);
      await showSuccessAlert(
        'Password RT Direset',
        `Email: ${userEmail}\nPassword Baru: ${newPassword}\n\nPassword telah direset ke default: passw0rd\nBagikan password ini ke RT.`
      );
    } catch (error: any) {
      console.error('Error:', error);
      await showErrorAlert('Error', 'Gagal mereset password RT');
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Manajemen RT</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Total {rts.length} RT terdaftar</p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          + Tambah RT Baru
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl md:text-3xl">👔</span>
              <p className="text-xs md:text-sm text-gray-600">Total RT</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{rts.length}</p>
          </div>
        </div>
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-1"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl md:text-3xl">✅</span>
              <p className="text-xs md:text-sm text-gray-600">RT Aktif</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{rts.length}</p>
          </div>
        </div> */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl md:text-3xl">�</span>
              <p className="text-xs md:text-sm text-gray-600">Total Warga</p>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{totalWarga}</p>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Cari nama, email, atau area..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-t-4 border-[#FF9500]"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366]">Nama</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366] hidden md:table-cell">Email</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366] hidden md:table-cell">Telepon</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#003366]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-3 md:py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredRts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-3 md:py-4 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data RT'}
                  </td>
                </tr>
              ) : (
                filteredRts.map((rt) => (
                  <tr key={rt.id} className="border-b border-gray-100 hover:bg-[#F0F8FF] transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <p className="font-medium text-gray-900 text-sm md:text-base">{rt.name}</p>
                      <p className="text-xs text-gray-500 md:hidden">{rt.user_email}</p>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-sm hidden md:table-cell">{rt.user_email}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-sm hidden md:table-cell">{rt.phone || '-'}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-sm space-x-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => router.push(`/rt-management/${rt.id}`)}
                        className="text-[#003366] hover:text-[#004d80] font-medium text-xs transition-colors whitespace-nowrap"
                      >
                        📋 Detail
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => {
                          setEditingId(rt.id);
                          setFormData({
                            name: rt.name,
                            email: rt.user_email,
                            phone: rt.phone,
                            area: rt.area,
                            address: rt.address,
                          });
                          setModalOpen(true);
                        }}
                        className="text-[#003366] hover:text-[#004d80] font-medium text-xs transition-colors whitespace-nowrap"
                      >
                        ✏️ Edit
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => handleResetRTPassword(rt.id, rt.name)}
                        className="text-orange-600 hover:text-orange-800 font-medium text-xs transition-colors whitespace-nowrap"
                      >
                        🔐 Reset Pass
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => handleDeleteRT(rt.id, rt.name)}
                        className="text-[#EF4444] hover:text-[#DC2626] font-medium text-xs transition-colors whitespace-nowrap"
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit RT' : 'Tambah RT Baru'}>
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama RT *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama RT"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (Login) *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Masukkan email RT"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              required
              disabled={editingId !== null}
            />
            {!editingId && <p className="text-xs text-gray-500 mt-1">Email akan digunakan untuk login RT</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder="Nomor telepon RT"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Alamat lengkap RT"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#003366] text-white py-2 rounded-lg hover:bg-[#002244] font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : editingId ? 'Update' : 'Buat Akun RT'}
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
