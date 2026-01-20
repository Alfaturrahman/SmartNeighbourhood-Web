"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';

const DUMMY_SCHEDULE = [
  { id: 1, name: 'Budi Santoso', shift: 'Pagi', date: '2024-01-20', time: '06:00 - 12:00', status: 'aktif' },
  { id: 2, name: 'Ahmad Wijaya', shift: 'Siang', date: '2024-01-20', time: '12:00 - 18:00', status: 'aktif' },
  { id: 3, name: 'Riyanto', shift: 'Malam', date: '2024-01-20', time: '18:00 - 06:00', status: 'aktif' },
  { id: 4, name: 'Budi Santoso', shift: 'Pagi', date: '2024-01-21', time: '06:00 - 12:00', status: 'aktif' },
  { id: 5, name: 'Ahmad Wijaya', shift: 'Siang', date: '2024-01-21', time: '12:00 - 18:00', status: 'aktif' },
];

export default function SecuritySchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('resident');
  const [formData, setFormData] = useState({
    name: '',
    shift: 'Pagi',
    date: '',
    time: '06:00 - 12:00',
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
    if (!permissions.canViewSchedule) {
      router.push('/dashboard');
      return;
    }
    
    setSchedules(DUMMY_SCHEDULE);
  }, [router]);

  const getShiftColor = (shift: string) => {
    switch(shift) {
      case 'Pagi': return 'bg-yellow-100 text-yellow-800';
      case 'Siang': return 'bg-orange-100 text-orange-800';
      case 'Malam': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', shift: 'Pagi', date: '', time: '06:00 - 12:00', status: 'aktif' });
    setModalOpen(true);
  };

  const openEditModal = (schedule: any) => {
    setEditingId(schedule.id);
    setFormData({
      name: schedule.name,
      shift: schedule.shift,
      date: schedule.date,
      time: schedule.time,
      status: schedule.status,
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const permissions = getPermissions(userRole);
    if (!permissions.canManageSchedule) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengelola jadwal keamanan');
      return;
    }
    
    setIsLoading(true);

    setTimeout(async () => {
      if (editingId) {
        const updatedSchedules = schedules.map(s =>
          s.id === editingId ? { ...s, ...formData } : s
        );
        setSchedules(updatedSchedules);
        setIsLoading(false);
        setModalOpen(false);
        await showSuccessAlert('Berhasil!', 'Jadwal keamanan berhasil diperbarui');
      } else {
        const newSchedule = {
          id: Math.max(...schedules.map(s => s.id), 0) + 1,
          ...formData,
        };
        setSchedules([...schedules, newSchedule]);
        setIsLoading(false);
        setModalOpen(false);
        await showSuccessAlert('Berhasil!', 'Jadwal keamanan baru berhasil ditambahkan');
      }
    }, 600);
  };

  const handleDelete = async (schedule: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageSchedule) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus jadwal keamanan');
      return;
    }
    
    const result = await showConfirmAlert(
      'Hapus Jadwal',
      `Apakah Anda yakin ingin menghapus jadwal ${schedule.name}?`,
      'Ya, Hapus'
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      setTimeout(() => {
        setSchedules(schedules.filter(s => s.id !== schedule.id));
        setIsLoading(false);
        showSuccessAlert('Berhasil!', 'Jadwal keamanan telah dihapus');
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
                <h2 className="text-3xl font-bold text-[#003366]">Jadwal Keamanan</h2>
                <p className="text-gray-600 mt-1">Kelola jadwal petugas keamanan</p>
              </div>
              {getPermissions(userRole).canManageSchedule && (
                <button onClick={openAddModal} className="px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                  + Tambah Jadwal
                </button>
              )}
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-t-4 border-[#66CC66]"></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Nama Petugas</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Shift</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Tanggal</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Jam</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="border-b border-gray-100 hover:bg-[#F0F8FF] transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{schedule.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getShiftColor(schedule.shift)}`}>
                            {schedule.shift}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{schedule.date}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm font-medium">{schedule.time}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ {schedule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {getPermissions(userRole).canManageSchedule ? (
                            <>
                              <button onClick={() => openEditModal(schedule)} className="text-[#003366] hover:text-[#004d80] font-medium text-xs transition-colors">✏️ Edit</button>
                              <span className="text-gray-300">•</span>
                              <button onClick={() => handleDelete(schedule)} className="text-[#EF4444] hover:text-[#DC2626] font-medium text-xs transition-colors">🗑️ Hapus</button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">Hanya lihat</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        title={editingId ? 'Edit Jadwal Keamanan' : 'Tambah Jadwal Keamanan Baru'}
        onClose={() => !isLoading && setModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nama Petugas *
              </label>
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Shift *
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              >
                <option value="Pagi">🌅 Pagi (06:00 - 12:00)</option>
                <option value="Siang">☀️ Siang (12:00 - 18:00)</option>
                <option value="Malam">🌙 Malam (18:00 - 06:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tanggal *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              Jam Dinas *
            </label>
            <input
              type="text"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="Contoh: 06:00 - 12:00"
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
