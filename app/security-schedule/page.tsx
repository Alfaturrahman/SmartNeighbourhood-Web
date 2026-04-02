"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';
import { securityScheduleService } from '@/services/modules/securityScheduleService';
import { securityPersonnelService } from '@/services/modules/securityPersonnelService';
import type { SecuritySchedule, SecurityScheduleFormData } from '@/types';

export default function SecuritySchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('warga');
  const [formData, setFormData] = useState<SecurityScheduleFormData>({
    name: '',
    shift: 'Pagi',
    schedule_type: 'daily',
    date: '',
    weekday: 0,
    month_day: 1,
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
    
    setIsMounted(true);
    fetchSchedules();
    fetchPersonnel();
  }, [router]);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await securityScheduleService.getAll();
      const data = (response.results || response.data || []) as SecuritySchedule[];
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      await showErrorAlert('Error', 'Gagal memuat data jadwal keamanan');
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const response = await securityPersonnelService.getAll({ status: 'aktif' });
      const data = (response.results || response.data || []) as any[];
      setPersonnel(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching personnel:', error);
      setPersonnel([]);
    }
  };

  const getShiftColor = (shift: string) => {
    switch(shift) {
      case 'Pagi': return 'bg-yellow-100 text-yellow-800';
      case 'Siang': return 'bg-orange-100 text-orange-800';
      case 'Malam': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openAddModal = () => {
    if (personnel.length === 0) {
      showErrorAlert('Master Keamanan Kosong', 'Tambahkan petugas keamanan di Master Data Keamanan terlebih dahulu sebelum membuat jadwal.').then(() => {
        router.push('/security-personnel');
      });
      return;
    }
    setEditingId(null);
    setFormData({ 
      name: '', 
      shift: 'Pagi', 
      schedule_type: 'daily',
      date: '', 
      start_date: '',
      end_date: '',
      weekday: 0,
      month_day: 1,
      time: '06:00 - 12:00', 
      status: 'aktif' 
    });
    setModalOpen(true);
  };

  const openEditModal = (schedule: any) => {
    setEditingId(schedule.id);
    setFormData({
      name: schedule.name,
      shift: schedule.shift,
      schedule_type: schedule.schedule_type || 'daily',
      date: schedule.date || '',
      start_date: schedule.start_date || '',
      end_date: schedule.end_date || '',
      weekday: schedule.weekday ?? 0,
      month_day: schedule.month_day ?? 1,
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

    try {
      if (editingId) {
        await securityScheduleService.update(editingId, formData);
        await showSuccessAlert('Berhasil!', 'Jadwal keamanan berhasil diperbarui');
      } else {
        await securityScheduleService.create(formData);
        await showSuccessAlert('Berhasil!', 'Jadwal keamanan baru berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchSchedules();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      await showErrorAlert('Error', error.response?.data?.error || 'Gagal menyimpan jadwal keamanan');
    } finally {
      setIsLoading(false);
    }
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
      try {
        await securityScheduleService.delete(schedule.id);
        await showSuccessAlert('Berhasil!', 'Jadwal keamanan telah dihapus');
        fetchSchedules();
      } catch (error: any) {
        console.error('Error deleting schedule:', error);
        await showErrorAlert('Error', error.response?.data?.error || 'Gagal menghapus jadwal keamanan');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Jadwal Keamanan</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Kelola jadwal petugas keamanan</p>
        </div>
        {isMounted && userRole === 'rw' && (
          <button onClick={openAddModal} className="w-full sm:w-auto px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Jenis Jadwal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Rincian</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Jam</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#003366]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => {
                let scheduleLabel = '';
                if (schedule.schedule_type === 'weekly' && schedule.weekday !== undefined) {
                  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                  if (schedule.start_date && schedule.end_date) {
                    scheduleLabel = `Setiap ${days[schedule.weekday]} (${new Date(schedule.start_date).toLocaleDateString('id-ID')} - ${new Date(schedule.end_date).toLocaleDateString('id-ID')})`;
                  } else {
                    scheduleLabel = `Setiap ${days[schedule.weekday]}`;
                  }
                } else if (schedule.schedule_type === 'monthly' && schedule.month_day) {
                  if (schedule.start_date && schedule.end_date) {
                    scheduleLabel = `Tanggal ${schedule.month_day} (${new Date(schedule.start_date).toLocaleDateString('id-ID')} - ${new Date(schedule.end_date).toLocaleDateString('id-ID')})`;
                  } else {
                    scheduleLabel = `Tanggal ${schedule.month_day} tiap bulan`;
                  }
                } else {
                  scheduleLabel = schedule.date || 'N/A';
                }
                
                return (
                <tr key={schedule.id} className="border-b border-gray-100 hover:bg-[#F0F8FF] transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{schedule.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getShiftColor(schedule.shift)}`}>
                      {schedule.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {schedule.schedule_type === 'daily' && '📅 Harian'}
                      {schedule.schedule_type === 'weekly' && '📆 Mingguan'}
                      {schedule.schedule_type === 'monthly' && '📊 Bulanan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{scheduleLabel}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm font-medium">{schedule.time}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {isMounted && userRole === 'rw' ? (
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
              );
            })}
            </tbody>
          </table>
        </div>
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
              {personnel.length === 0 ? (
                <div className="w-full px-4 py-2 border-2 border-orange-400 rounded-lg bg-orange-50">
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
                    <div className="flex-1">
                      <p className="text-orange-900 font-semibold text-sm mb-2">Tidak ada petugas aktif</p>
                      <p className="text-orange-700 text-xs mb-3">Anda harus menambahkan petugas keamanan terlebih dahulu di Master Data Keamanan sebelum membuat jadwal.</p>
                      <a href="/security-personnel" className="text-orange-600 hover:text-orange-700 font-semibold text-xs underline hover:no-underline transition-all inline-block">
                        → Buka Master Data Keamanan
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="">Pilih Petugas Keamanan</option>
                  {personnel.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.area || 'Umum'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Shift *
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'Pagi' | 'Siang' | 'Malam' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              >
                <option value="Pagi">🌅 Pagi (06:00 - 12:00)</option>
                <option value="Siang">☀️ Siang (12:00 - 18:00)</option>
                <option value="Malam">🌙 Malam (18:00 - 06:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tipe Jadwal *
              </label>
              <select
                value={formData.schedule_type}
                onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              >
                <option value="daily">📅 Harian</option>
                <option value="weekly">📆 Mingguan</option>
                <option value="monthly">📊 Bulanan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'tidak aktif' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              >
                <option value="aktif">✓ Aktif</option>
                <option value="tidak aktif">✕ Tidak Aktif</option>
              </select>
            </div>
          </div>

          {formData.schedule_type === 'daily' && (
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
          )}

          {formData.schedule_type === 'weekly' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tanggal Berakhir *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Hari *
                </label>
                <select
                  value={formData.weekday ?? 0}
                  onChange={(e) => setFormData({ ...formData, weekday: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                >
                  <option value={0}>Senin</option>
                  <option value={1}>Selasa</option>
                  <option value={2}>Rabu</option>
                  <option value={3}>Kamis</option>
                  <option value={4}>Jumat</option>
                  <option value={5}>Sabtu</option>
                  <option value={6}>Minggu</option>
                </select>
              </div>
            </>
          )}

          {formData.schedule_type === 'monthly' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tanggal Berakhir *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tanggal Bulan (1-31) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.month_day ?? 1}
                  onChange={(e) => setFormData({ ...formData, month_day: Math.min(31, Math.max(1, parseInt(e.target.value) || 1)) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </>
          )}

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
